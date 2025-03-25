const Tour = require("../../models/tour.model");

const list = async (req, res) => {
	const tourList = await Tour.find({});
	console.log(tourList);
	res.render("client/pages/tour_list", {
		titlePage: "Danh sách tour",
		tourList: tourList,
	});
};
const del = async (req, res) => {
	const tourList = await Tour.find({});
	res.render("client/pages/tour_list", {
		titlePage: "Danh sách tour xoá",
		tourList: tourList,
	});
};
const create = async (req, res) => {
	const tourList = await Tour.find({});
	res.render("client/pages/tour_list", {
		titlePage: "Danh sách tour tạo mới",
		tourList: tourList,
	});
};

module.exports = { list, del, create };
