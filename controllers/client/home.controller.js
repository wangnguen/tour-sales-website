const homeController = (req, res) => {
	res.render("client/pages/home", {
		titlePage: "Trang chủ",
	});
};
module.exports = { homeController };
