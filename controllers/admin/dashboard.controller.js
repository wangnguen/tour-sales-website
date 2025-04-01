const dashboard = (req, res) => {
	res.render("admin/pages/dashboard", {
		titlePage: "Trang tổng quan",
	});
};

module.exports = {
	dashboard,
};
