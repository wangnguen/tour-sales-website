const list = (req, res) => {
	res.render("admin/pages/tour_list", {
		titlePage: "Quản lý tour",
	});
};
const create = (req, res) => {
	res.render("admin/pages/tour_create", {
		titlePage: "Tạo tour",
	});
};
const trash = (req, res) => {
	res.render("admin/pages/tour_trash", {
		titlePage: "Thùng rác tour",
	});
};

module.exports = {
	list,
	create,
	trash,
};
