const Tour = require("../../models/tour.model");

const Category = require("../../models/category.model");

const detail = async (req, res) => {
	const slug = req.params.slug;

	// Tìm tour theo slug
	const tourDetail = await Tour.findOne({
		slug: slug,
		status: "active",
		deleted: false,
	});
	// Hết tìm tour theo slug

	if (tourDetail) {
		// Breadcrumb
		var breadcrumb = {
			image: tourDetail.avatar,
			title: tourDetail.name,
			list: [
				{
					link: "/",
					title: "Trang chủ",
				},
			],
		};

		const category = await Category.findOne({
			_id: tourDetail.category,
			deleted: false,
			status: "active",
		});

		if (category) {
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
		}

		breadcrumb.list.push({
			link: `/tour/detail/${slug}`,
			title: tourDetail.name,
		});
		// End breadcrumb

		res.render("client/pages/tour_detail", {
			titlePage: "Chi tiết tour",
			breadcrumb: breadcrumb,
			tourDetail,
		});
	} else {
		res.redirect("/");
	}
};

module.exports = { detail };
