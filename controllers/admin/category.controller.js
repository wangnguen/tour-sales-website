const Category = require("../../models/category.model");

const list = (req, res) => {
	res.render("admin/pages/category_list", {
		titlePage: "Quản lý danh mục",
	});
};
const create = (req, res) => {
	res.render("admin/pages/category_create", {
		titlePage: "Tạo danh mục",
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
