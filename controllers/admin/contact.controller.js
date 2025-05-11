const moment = require("moment");
const Contact = require("../../models/contact.model");

const list = async (req, res) => {
	const find = {
		deleted: false,
	};

	const contactList = await Contact.find(find).sort({
		createdAt: "desc",
	});

	for (const item of contactList) {
		item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
	}

	res.render("admin/pages/contact_list", {
		titlePage: "Thông tin liên hệ",
		contactList: contactList,
	});
};

module.exports = {
	list,
};
