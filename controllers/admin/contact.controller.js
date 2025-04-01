const list = (req, res) => {
	res.render("admin/pages/contact_list", {
		titlePage: "Thông tin liên hệ",
	});
};

module.exports = {
	list,
};
