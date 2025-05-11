const moment = require("moment");

const Tour = require("../../models/tour.model");

const categoryHelper = require("../../helpers/category.helper");

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

	// Section 4: Tour trong nước
	const categoryIdSection4 = "67fe66a0cb97940480be72b7";

	const listCategoryId = await categoryHelper.getAllSubcategoryIds(
		categoryIdSection4,
	);

	const tourListSection4 = await Tour.find({
		category: { $in: listCategoryId },
		deleted: false,
		status: "active",
	})
		.sort({
			position: "desc",
		})
		.limit(8);

	for (const item of tourListSection4) {
		item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
	}
	// End section 4 : Tour trong nước

	res.render("client/pages/home", {
		titlePage: "Trang chủ",
		tourListSection2: tourListSection2,
		tourListSection4: tourListSection4,
	});
};
module.exports = { homeController };
