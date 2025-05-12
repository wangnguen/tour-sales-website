const Tour = require("../../models/tour.model");

const detail = async (req, res) => {
	res.render("client/pages/tour_detail", {
		titlePage: "Chi tiết tour",
	});
};

module.exports = { detail };
