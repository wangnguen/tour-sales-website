const list = (req, res) => {
	res.render("admin/pages/order_list", {
		titlePage: "Quản lý đơn hàng",
	});
};
const edit = (req, res) => {
	res.render("admin/pages/order_edit", {
		titlePage: "Đơn hàng: OD000001",
	});
};

module.exports = {
	list,
	edit,
};
