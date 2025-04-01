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

module.exports = {
	list,
	create,
};
