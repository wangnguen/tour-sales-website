const moment = require("moment");

const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const Tour = require("../../models/tour.model");

const AccountAdmin = require("../../models/admin_account.model");

const categoryHelper = require("../../helpers/category.helper");

const list = async (req, res) => {
	const find = {
		deleted: false,
	};

	const tourList = await Tour.find(find).sort({
		position: "desc",
	});

	for (const item of tourList) {
		if (item.createdBy) {
			const infoAccountCreated = await AccountAdmin.findOne({
				_id: item.createdBy,
			});
			item.createdByFullName = infoAccountCreated.fullName;
		}

		if (item.updatedBy) {
			const infoAccountUpdated = await AccountAdmin.findOne({
				_id: item.updatedBy,
			});
			item.updatedByFullName = infoAccountUpdated.fullName;
		}

		item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
		item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
	}

	res.render("admin/pages/tour_list", {
		pageTitle: "Quản lý tour",
		tourList: tourList,
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

	res.json({
		code: "success",
	});
};

const edit = async (req, res) => {
	try {
		const id = req.params.id;

		const tourDetail = await Tour.findOne({
			_id: id,
			deleted: false,
		});

		if (tourDetail) {
			tourDetail.departureDateFormat = moment(tourDetail.departureDate).format(
				"YYYY-MM-DD",
			);

			const categoryList = await Category.find({
				deleted: false,
			});

			const categoryTree = categoryHelper.buildCategoryTree(categoryList);

			const cityList = await City.find({});

			res.render("admin/pages/tour_edit", {
				pageTitle: "Chỉnh sửa tour",
				categoryList: categoryTree,
				cityList: cityList,
				tourDetail: tourDetail,
			});
		} else {
			res.redirect(`/${pathAdmin}/tour/list`);
		}
	} catch (error) {
		res.redirect(`/${pathAdmin}/tour/list`);
	}
};

const editPatch = async (req, res) => {
	try {
		const id = req.params.id;

		if (req.body.position) {
			req.body.position = parseInt(req.body.position);
		} else {
			const totalRecord = await Tour.countDocuments({});
			req.body.position = totalRecord + 1;
		}

		req.body.updatedBy = req.account.id;
		if (req.file) {
			req.body.avatar = req.file.path;
		} else {
			delete req.body.avatar;
		}

		req.body.priceAdult = req.body.priceAdult
			? parseInt(req.body.priceAdult)
			: 0;
		req.body.priceChildren = req.body.priceChildren
			? parseInt(req.body.priceChildren)
			: 0;
		req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;

		req.body.priceNewAdult = req.body.priceNewAdult
			? parseInt(req.body.priceNewAdult)
			: req.body.priceAdult;
		req.body.priceNewChildren = req.body.priceNewChildren
			? parseInt(req.body.priceNewChildren)
			: req.body.priceChildren;
		req.body.priceNewBaby = req.body.priceNewBaby
			? parseInt(req.body.priceNewBaby)
			: req.body.priceBaby;

		req.body.stockAdult = req.body.stockAdult
			? parseInt(req.body.stockAdult)
			: 0;
		req.body.stockChildren = req.body.stockAdult
			? parseInt(req.body.stockChildren)
			: 0;
		req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
		req.body.locations = req.body.locations
			? JSON.parse(req.body.locations)
			: [];
		req.body.departureDate = req.body.departureDate
			? new Date(req.body.departureDate)
			: null;
		req.body.schedules = req.body.schedules
			? JSON.parse(req.body.schedules)
			: [];

		await Tour.updateOne(
			{
				_id: id,
				deleted: false,
			},
			req.body,
		);

		req.flash("success", "Cập nhật tour thành công!");
		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không hợp lệ!",
		});
	}
};

const trash = (req, res) => {
	res.render("admin/pages/tour_trash", {
		titlePage: "Thùng rác tour",
	});
};

module.exports = {
	list,
	create,
	createPost,
	edit,
	editPatch,
	trash,
};
