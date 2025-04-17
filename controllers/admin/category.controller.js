const Category = require("../../models/category.model");
const categoryHelper = require("../../helpers/category.helper");

const list = (req, res) => {
	res.render("admin/pages/category_list", {
		titlePage: "Quản lý danh mục",
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

	res.json({
		code: "success",
		message: "Tạo danh mục thành công!",
	});
};

module.exports = {
	list,
	create,
	createPost,
};
