const moment = require("moment");

const Tour = require("../../models/tour.model");

const homeController = async (req, res) => {
	// Section 2
	const tourListSection2 = await Tour.find({
		deleted: false,
		status: "active",
	})
		.sort({
			position: "desc",
		})
		.limit(6);
	for (const item of tourListSection2) {
		item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
	}
	// End section 2

	res.render("client/pages/home", {
		titlePage: "Trang chủ",
		tourListSection2: tourListSection2,
	});
};
module.exports = { homeController };
