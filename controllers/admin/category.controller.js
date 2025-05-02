const moment = require("moment");
const slugify = require("slugify");
const Category = require("../../models/category.model");
const AccountAdmin = require("../../models/admin_account.model");
const categoryHelper = require("../../helpers/category.helper");

const list = async (req, res) => {
	const find = {
		deleted: "false",
	};
	// Loc theo trang thai
	if (req.query.status) {
		find.status = req.query.status;
	}
	// Het loc theo trang thai

	// Loc theo nguoi tao
	if (req.query.createdBy) {
		find.createdBy = req.query.createdBy;
	}
	// Het loc theo nguoi tao

	// Loc theo ngay tao
	const dataFilter = {};

	if (req.query.startDate) {
		const startDate = moment(req.query.startDate).startOf("date").toDate();
		dataFilter.$gte = startDate;
	}
	if (req.query.endDate) {
		const endDate = moment(req.query.endDate).endOf("date").toDate();
		dataFilter.$lte = endDate;
	}
	if (Object.keys(dataFilter).length > 0) {
		find.createdAt = dataFilter;
	}
	// Het loc theo ngay tao

	// Tim kiem
	if (req.query.keyword) {
		const keyword = slugify(req.query.keyword, {
			lower: true,
			locale: "vi",
		});
		const keywordRegex = new RegExp(keyword, "i");

		find.slug = keywordRegex;
	}
	// Het tim kiem

	// Phan trang
	const limitItems = 5;
	let page = 1;
	if (req.query.page) {
		const currentPage = parseInt(req.query.page);
		if (currentPage > 0) {
			page = currentPage;
		}
	}
	const totalRecord = await Category.countDocuments(find);
	const totalPage = Math.max(Math.ceil(totalRecord / limitItems), 1);
	if (totalPage === 0) {
		page = 1;
	} else if (page > totalPage) {
		page = totalPage;
	}
	const skip = (page - 1) * limitItems;
	const pagination = {
		skip: skip,
		totalRecord: totalRecord,
		totalPage: totalPage,
	};
	// Het phan trang

	const categoryList = await Category.find(find)
		.sort({
			position: "desc",
		})
		.limit(limitItems)
		.skip(skip);

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

	// Danh sach tai khoan quan tri
	const accountAdminList = await AccountAdmin.find({}).select("id fullName");
	// Het danh sach tai khoan quan tri

	res.render("admin/pages/category_list", {
		titlePage: "Quản lý danh mục",
		categoryList: categoryList,
		accountAdminList: accountAdminList,
		pagination: pagination,
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

const edit = async (req, res) => {
	try {
		const categoryList = await Category.find({
			deleted: false,
		});

		const categoryTree = categoryHelper.buildCategoryTree(categoryList);

		const id = req.params.id;

		const categoryDetail = await Category.findOne({
			_id: id,
			deleted: false,
		});

		if (categoryDetail) {
			res.render("admin/pages/category_edit", {
				titlePage: "Tạo danh mục",
				categoryList: categoryTree,
				categoryDetail: categoryDetail,
			});
		} else {
			res.redirect(`/${pathAdmin}/category/list`);
		}
	} catch (error) {
		res.redirect(`/${pathAdmin}/category/list`);
	}
};
const editPatch = async (req, res) => {
	try {
		const id = req.params.id;

		if (req.body.position) {
			req.body.position = parseInt(req.body.position);
		} else {
			const totalRecord = await Category.countDocuments({});
			req.body.position = totalRecord + 1;
		}

		req.body.updatedBy = req.account.id;
		if (req.file) {
			req.body.avatar = req.file.path;
		} else {
			delete req.body.avatar;
		}

		await Category.updateOne(
			{
				_id: id,
				deleted: false,
			},
			req.body,
		);

		req.flash("success", "Cập nhật danh mục thành công!");

		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id is invalid !",
		});
	}
};

const deletePatch = async (req, res) => {
	try {
		const id = req.params.id;
		await Category.updateOne(
			{
				_id: id,
			},
			{
				deleted: true,
				deletedBy: req.account.id,
				deletedAt: Date.now(),
			},
		);
		req.flash("success", "Xoá danh mục thành công !");
		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không hợp lệ !",
		});
	}
};

const changeMultiPatch = async (req, res) => {
	try {
		const { option, ids } = req.body;
		switch (option) {
			case "active":
			case "inactive":
				await Category.updateMany(
					{
						_id: { $in: ids },
					},
					{
						status: option,
					},
				);
				req.flash("success", "Đổi trạng thái thành công !");
				break;

			case "delete":
				await Category.updateMany(
					{
						_id: { $in: ids },
					},
					{
						deleted: true,
						deletedBy: req.account.id,
						deletedAt: Date.now(),
					},
				);
				req.flash("success", "Xoá thành công !");
				break;
		}
		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không tồn tại trong hệ thống !",
		});
	}
};

module.exports = {
	list,
	create,
	createPost,
	edit,
	editPatch,
	deletePatch,
	changeMultiPatch,
};
