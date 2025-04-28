const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const Tour = require("../../models/tour.model");
const categoryHelper = require("../../helpers/category.helper");

const list = (req, res) => {
	res.render("admin/pages/tour_list", {
		titlePage: "Quản lý tour",
	});
};
const create = async (req, res) => {
	const categoryList = await Category.find({
		deleted: false,
	});

	const categoryTree = categoryHelper.buildCategoryTree(categoryList);
	const cityList = await City.find({});

	res.render("admin/pages/tour_create", {
		titlePage: "Tạo tour",
		categoryList: categoryTree,
		cityList: cityList,
	});
};

const createPost = async (req, res) => {
	if (req.body.position) {
		req.body.position = parseInt(req.body.position);
	} else {
		const totalRecord = await Tour.countDocuments({});
		req.body.position = totalRecord + 1;
	}

	req.body.createdBy = req.account.id;
	req.body.updatedBy = req.account.id;
	req.body.avatar = req.file ? req.file.path : "";

	req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
	req.body.priceChildren = req.body.priceChildren
		? parseInt(req.body.priceChildren)
		: 0;
	req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

	req.body.priceNewAdult = req.body.priceNewAdult
		? parseInt(req.body.priceAdult)
		: req.body.priceAdult;
	req.body.priceNewChildren = req.body.priceNewChildren
		? parseInt(req.body.priceAdult)
		: req.body.priceChildren;
	req.body.priceNewBaby = req.body.priceNewBaby
		? parseInt(req.body.priceAdult)
		: req.body.priceBaby;

	req.body.stockAdult = req.body.priceNewBaby
		? parseInt(req.body.stockAdult)
		: 0;
	req.body.stockChildren = req.body.stockChildren
		? parseInt(req.body.stockChildren)
		: 0;
	req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;

	req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
	req.body.departureDate = req.body.departureDate
		? new Date(req.body.departureDate)
		: null;
	req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

	const newRecord = new Tour(req.body);
	newRecord.save();

	req.flash("success", "Tạo tour thành công !");

	console.log(req.body);
	res.json({
		code: "success",
	});
};

const trash = (req, res) => {
	res.render("admin/pages/tour_trash", {
		titlePage: "Thùng rác tour",
	});
};

module.exports = {
	list,
	create,
	trash,
	createPost,
};
