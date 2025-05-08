const bcrypt = require("bcryptjs");
const moment = require("moment");

const SettingWebsiteInfo = require("../../models/setting_website_info.model");
const Role = require("../../models/role.model");
const AccountAdmin = require("../../models/admin_account.model");
const permissionConfig = require("../../configs/permission");

const list = (req, res) => {
	res.render("admin/pages/setting_list", {
		titlePage: "Cài đặt chung",
	});
};
const websiteInfo = async (req, res) => {
	const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

	res.render("admin/pages/setting_website_info", {
		titlePage: "Thông tin website",
		settingWebsiteInfo: settingWebsiteInfo,
	});
};

const websiteInfoPatch = async (req, res) => {
	if (req.files && req.files.logo) {
		req.body.logo = req.files.logo[0].path;
	} else {
		delete req.body.logo;
	}

	if (req.files && req.files.favicon) {
		req.body.favicon = req.files.favicon[0].path;
	} else {
		delete req.body.favicon;
	}

	const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
	if (settingWebsiteInfo) {
		await SettingWebsiteInfo.updateOne(
			{
				_id: settingWebsiteInfo.id,
			},
			req.body,
		);
	} else {
		const newRecord = new SettingWebsiteInfo(req.body);
		await newRecord.save();
	}

	req.flash("success", "Cập nhật thành công!");

	res.json({
		code: "success",
	});
};

const accountAdminList = async (req, res) => {
	const find = {
		deleted: false,
	};

	// loc theo trang thai
	if (req.query.status) {
		find.status = req.query.status;
	}
	// het loc theo trang thai

	// Loc theo ngay tao
	const dataFilter = {};

	if (req.query.startDate) {
		const startDate = moment(req.query.startDate).startOf("date").toDate();
		dataFilter.$gte = startDate;
	}
	if (req.query.endDate) {
		const endDate = moment(req.query.endDate).endOf("date").toDate();
		dataFilter.$lte = endDate;
	}
	if (Object.keys(dataFilter).length > 0) {
		find.createdAt = dataFilter;
	}
	// Het loc theo ngay tao

	// loc theo quyen
	if (req.query.role) {
		find.role = req.query.role;
	}
	// het loc theo quyen

	// Tìm kiếm
	if (req.query.keyword) {
		const keyword = req.query.keyword;
		const keywordRegex = new RegExp(keyword, "i");
		console.log(keywordRegex);
		find.fullName = keywordRegex;
	}
	// Hết Tìm kiếm

	// Phân trang
	const limitItems = 5;
	let page = 1;
	if (req.query.page) {
		const currentPage = parseInt(req.query.page);
		if (currentPage > 0) {
			page = currentPage;
		}
	}
	const totalRecord = await AccountAdmin.countDocuments(find);
	const totalPage = Math.ceil(totalRecord / limitItems);
	if (totalPage === 0) {
		page = 1;
	} else if (page > totalPage) {
		page = totalPage;
	}
	const skip = (page - 1) * limitItems;
	const pagination = {
		skip: skip,
		totalRecord: totalRecord,
		totalPage: totalPage,
	};
	// Hết Phân trang

	const accountAdminList = await AccountAdmin.find(find).sort({
		createdAt: "desc",
	});

	for (const item of accountAdminList) {
		if (item.role) {
			const roleInfo = await Role.findOne({
				_id: item.role,
			});

			if (roleInfo) {
				item.roleName = roleInfo.name;
			}
		}
	}

	const roleList = await Role.find({
		deleted: false,
	});

	res.render("admin/pages/setting_account_admin_list", {
		titlePage: "Tài khoản quản trị",
		accountAdminList: accountAdminList,
		roleList: roleList,
		
		pagination: pagination,
	});
};
const accountAdminCreate = async (req, res) => {
	const roleList = await Role.find({ deleted: false });

	res.render("admin/pages/setting_account_admin_create", {
		titlePage: "Tạo tài khoản quản trị",
		roleList: roleList,
	});
};

const accountAdminCreatePost = async (req, res) => {
	const existAccount = await AccountAdmin.findOne({
		email: req.body.email,
	});

	if (existAccount) {
		res.json({
			code: "error",
			message: "Email đã tồn tại trong hệ thống!",
		});
		return;
	}

	req.body.createdBy = req.account.id;
	req.body.updatedBy = req.account.id;
	req.body.avatar = req.file ? req.file.path : ""; // Mã hóa mật khẩu với bcrypt
	const salt = await bcrypt.genSalt(10); // Tạo ra chuỗi ngẫu nhiên có 10 ký tự
	req.body.password = await bcrypt.hash(req.body.password, salt);

	const newAccount = new AccountAdmin(req.body);
	await newAccount.save();

	req.flash("success", "Tạo tài khoản quản trị thành công!");

	res.json({
		code: "success",
	});
};

const accountAdminEdit = async (req, res) => {
	try {
		const roleList = await Role.find({
			deleted: false,
		});

		const id = req.params.id;
		const accountAdminDetail = await AccountAdmin.findOne({
			_id: id,
			deleted: false,
		});

		if (!accountAdminDetail) {
			res.redirect(`/${pathAdmin}/setting/account_admin/list`);
			return;
		}

		res.render("admin/pages/setting_account_admin_edit", {
			pageTitle: "Chỉnh sửa tài khoản quản trị",
			roleList: roleList,
			accountAdminDetail: accountAdminDetail,
		});
	} catch (error) {
		res.redirect(`/${pathAdmin}/setting/account_admin/list`);
	}
};

const accountAdminEditPatch = async (req, res) => {
	try {
		const id = req.params.id;

		req.body.updatedBy = req.account.id;
		if (req.file) {
			req.body.avatar = req.file.path;
		} else {
			delete req.body.avatar;
		}

		// Mã hóa mật khẩu với bcrypt
		if (req.body.password) {
			const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
			req.body.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu
		}

		await AccountAdmin.updateOne(
			{
				_id: id,
				deleted: false,
			},
			req.body,
		);

		req.flash("success", "Cập nhật tài khoản quản trị thành công!");

		res.json({
			code: "success",
		});
	} catch (error) {
		res.redirect(`/${pathAdmin}/setting/account_admin/list`);
	}
};

const roleList = async (req, res) => {
	const roleList = await Role.find({
		deleted: false,
	});

	res.render("admin/pages/setting_role_list", {
		titlePage: "Nhóm quyền",
		roleList: roleList,
	});
};

const roleCreate = (req, res) => {
	res.render("admin/pages/setting_role_create", {
		titlePage: "Tạo nhóm quyền",
		permissionList: permissionConfig.permissionList,
	});
};
const roleCreatePost = async (req, res) => {
	req.body.createdBy = req.account.id;
	req.body.updatedBy = req.account.id;

	const newRecord = new Role(req.body);
	await newRecord.save();
	req.flash("success", "Tạo nhóm quyền thành công !");

	res.json({
		code: "success",
	});
};

const roleEdit = async (req, res) => {
	try {
		const id = req.params.id;
		const roleDetail = await Role.findOne({
			_id: id,
			deleted: false,
		});

		if (roleDetail) {
			res.render("admin/pages/setting_role_edit", {
				titlePage: "Chỉnh sửa nhóm quyền",
				permissionList: permissionConfig.permissionList,
				roleDetail: roleDetail,
			});
		} else {
			res.redirect(`$/{pathAdmin}/setting/role/list`);
		}
	} catch (error) {
		res.redirect(`$/{pathAdmin}/setting/role/list`);
	}
};

const roleEditPatch = async (req, res) => {
	try {
		const id = req.params.id;
		console.log(id);
		req.body.updatedBy = req.account.id;

		await Role.updateOne(
			{
				_id: id,
				deleted: false,
			},
			req.body,
		);
		req.flash("success", "Cập nhật nhóm quyền thành công !");

		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không tồn tại",
		});
	}
};

const changeMultiPatch = async (req, res) => {
	try {
		const { option, ids } = req.body;
		switch (option) {
			case "active":
			case "inactive":
				await AccountAdmin.updateMany(
					{
						_id: { $in: ids },
					},
					{
						status: option,
					},
				);
				req.flash("success", "Đổi trạng thái thành công !");
				break;

			case "delete":
				await AccountAdmin.updateMany(
					{
						_id: { $in: ids },
					},
					{
						deleted: true,
						deletedBy: req.account.id,
						deletedAt: Date.now(),
					},
				);
				req.flash("success", "Xoá thành công !");
				break;
		}
		res.json({
			code: "success",
		});
	} catch (error) {
		res.json({
			code: "error",
			message: "Id không tồn tại trong hệ thống !",
		});
	}
};

module.exports = {
	list,
	websiteInfo,
	websiteInfoPatch,
	accountAdminList,
	accountAdminCreate,
	accountAdminCreatePost,
	accountAdminEdit,
	accountAdminEditPatch,
	roleList,
	roleCreate,
	roleCreatePost,
	roleEdit,
	roleEditPatch,
	changeMultiPatch,
};
