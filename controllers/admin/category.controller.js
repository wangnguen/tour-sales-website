const moment = require("moment");

const Category = require("../../models/category.model");
const AccountAdmin = require("../../models/admin_account.model");
const categoryHelper = require("../../helpers/category.helper");

const list = async (req, res) => {
	const categoryList = await Category.find({
		deleted: "false",
	}).sort({
		position: "desc",
	});

	for (const item of categoryList) {
		if (item.createdBy) {
			const infoAccountCreated = await AccountAdmin.findOne({
				_id: item.createdBy,
			});
			item.createdByFullName = infoAccountCreated.fullName;
		}

		if (item.updatedBy) {
			const infoAccountUpdated = await AccountAdmin.findOne({
				_id: item.updatedBy,
			});
			item.updatedByFullName = infoAccountUpdated.fullName;
		}
		item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
		item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
	}

	res.render("admin/pages/category_list", {
		titlePage: "Quản lý danh mục",
		categoryList: categoryList,
	});
};
const create = async (req, res) => {
	const categoryList = await Category.find({
		deleted: false,
	});

	const categoryTree = categoryHelper.buildCategoryTree(categoryList);

	// console.log(categoryTree);

	res.render("admin/pages/category_create", {
		titlePage: "Tạo danh mục",
		categoryList: categoryTree,
	});
};

const createPost = async (req, res) => {
	if (req.body.position) {
		req.body.position = parseInt(req.body.position);
	} else {
		const totalRecord = await Category.countDocuments({});
		req.body.position = totalRecord + 1;
	}

	req.body.createdBy = req.account.id;
	req.body.updatedBy = req.account.id;
	req.body.avatar = req.file ? req.file.path : "";
	// console.log(req.file);

	const newRecord = new Category(req.body);
	await newRecord.save();

	req.flash("success", "Tạo danh mục thành công!");

	res.json({
		code: "success",
	});
};

module.exports = {
	list,
	create,
	createPost,
};
