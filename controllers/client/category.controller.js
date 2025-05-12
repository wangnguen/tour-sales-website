const moment = require("moment");

const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");

const categoryHelper = require("../../helpers/category.helper");

const list = async (req, res) => {
	// Lấy slug từ params
	const slug = req.params.slug;

	// Tìm danh mục theo slug
	const category = await Category.findOne({
		slug: slug,
		deleted: false,
		status: "active",
	});

	if (category) {
		// Breadcrumb
		var breadcrumb = {
			image: category.avatar,
			title: category.name,
			list: [
				{
					link: "/",
					title: "Trang chủ",
				},
			],
		};
		// Tìm danh mục cha
		if (category.parent) {
			const parentCategory = await Category.findOne({
				_id: category.parent,
				deleted: false,
				status: "active",
			});

			if (parentCategory) {
				breadcrumb.list.push({
					link: `/category/${parentCategory.slug}`,
					title: parentCategory.name,
				});
			}
		}

		// Thêm danh mục hiện tại
		breadcrumb.list.push({
			link: `/category/${category.slug}`,
			title: category.name,
		});

		// End breadcrumb

		// Danh sách tour

		const listCategoryId = await categoryHelper.getAllSubcategoryIds(
			category.id,
		);
		const find = {
			category: { $in: listCategoryId },
			deleted: false,
			status: "active",
		};
		const totalTour = await Tour.countDocuments(find);
		const tourList = await Tour.find(find).sort({
			position: "desc",
		});

		for (const item of tourList) {
			item.departureDateFormat = moment(item.departureDate).format(
				"DD/MM/YYYY",
			);
		}
		// End danh sách tour

		res.render("client/pages/tour_list", {
			titlePage: "Danh sách tour",
			breadcrumb: breadcrumb,
			category: category,
			tourList: tourList,
			totalTour: totalTour,
		});
	} else {
		res.redirect("/");
	}
};
module.exports = { list };
