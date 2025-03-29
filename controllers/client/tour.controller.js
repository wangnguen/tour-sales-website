const Tour = require("../../models/tour.model");

const list = async (req, res) => {
	const tourList = await Tour.find({});
	// console.log(tourList);
	res.render("client/pages/tour_list", {
		titlePage: "Danh sách tour",
		tourList: tourList,
	});
};

const detail = async (req, res) => {
	res.render("client/pages/tour_detail", {
		titlePage: "Chi tiết tour",
	});
};

module.exports = { list, detail };
