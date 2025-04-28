// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");
if (buttonMenuMobile) {
	const sider = document.querySelector(".sider");
	const siderOverlay = document.querySelector(".sider-overlay");

	buttonMenuMobile.addEventListener("click", () => {
		sider.classList.add("active");
		siderOverlay.classList.add("active");
	});

	siderOverlay.addEventListener("click", () => {
		sider.classList.remove("active");
		siderOverlay.classList.remove("active");
	});
}
// End Menu Mobile

// Schedule Section 8
const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");
if (scheduleSection8) {
	const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
	const listItem = scheduleSection8.querySelector(".inner-schedule-list");

	// Tạo mới
	if (buttonCreate) {
		buttonCreate.addEventListener("click", () => {
			const firstItem = listItem.querySelector(".inner-schedule-item");
			const cloneItem = firstItem.cloneNode(true);
			cloneItem.querySelector(".inner-schedule-head input").value = "";

			const body = cloneItem.querySelector(".inner-schedule-body");
			const id = `mce_${Date.now()}`;
			body.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`;

			listItem.appendChild(cloneItem);

			initTinyMCE(`#${id}`);
		});
	}

	listItem.addEventListener("click", (event) => {
		// Đóng/mở item
		if (event.target.closest(".inner-more")) {
			const parentItem = event.target.closest(".inner-schedule-item");
			if (parentItem) {
				parentItem.classList.toggle("hidden");
			}
		}

		// Xóa item
		if (event.target.closest(".inner-remove")) {
			const parentItem = event.target.closest(".inner-schedule-item");
			const totalItem = listItem.querySelectorAll(
				".inner-schedule-item",
			).length;
			if (parentItem && totalItem > 1) {
				parentItem.remove();
			}
		}
	});

	// Sắp xếp
	new Sortable(listItem, {
		animation: 150, // Thêm hiệu ứng mượt mà
		handle: ".inner-move", // Chỉ cho phép kéo bằng class .inner-move
		onStart: (event) => {
			const textarea = event.item.querySelector("[textarea-mce]");
			const id = textarea.id;
			tinymce.get(id).remove();
		},
		onEnd: (event) => {
			const textarea = event.item.querySelector("[textarea-mce]");
			const id = textarea.id;
			initTinyMCE(`#${id}`);
		},
	});
}
// End Schedule Section 8

// Filepond Image
const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filePond = {};
if (listFilepondImage.length > 0) {
	listFilepondImage.forEach((filepondImage) => {
		FilePond.registerPlugin(FilePondPluginImagePreview);
		FilePond.registerPlugin(FilePondPluginFileValidateType);

		let files = null;
		const elementImageDefault = filepondImage.closest("[image-default]");
		if (elementImageDefault) {
			const imageDefault = elementImageDefault.getAttribute("image-default");
			if (imageDefault) {
				files = [
					{
						source: imageDefault, // Đường dẫn ảnh
					},
				];
			}
		}

		filePond[filepondImage.name] = FilePond.create(filepondImage, {
			labelIdle: "+",
			files: files,
		});
	});
}
// End Filepond Image

// Biểu đồ doanh thu
const revenueChart = document.querySelector("#revenue-chart");
if (revenueChart) {
	new Chart(revenueChart, {
		type: "line",
		data: {
			labels: ["01", "02", "03", "04", "05"],
			datasets: [
				{
					label: "Tháng 04/2025", // Nhãn của dataset
					data: [1200000, 1800000, 3200000, 900000, 1600000], // Dữ liệu
					borderColor: "#4379EE", // Màu viền
					borderWidth: 1.5, // Độ dày của đường
				},
				{
					label: "Tháng 03/2025", // Nhãn của dataset
					data: [1000000, 900000, 1200000, 1200000, 1400000], // Dữ liệu
					borderColor: "#EF3826", // Màu viền
					borderWidth: 1.5, // Độ dày của đường
				},
			],
		},
		options: {
			plugins: {
				legend: {
					position: "bottom",
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: "Ngày",
					},
				},
				y: {
					title: {
						display: true,
						text: "Doanh thu (VND)",
					},
				},
			},
			maintainAspectRatio: false, // Không giữ tỷ lệ khung hình mặc định
		},
	});
}
// Hết Biểu đồ doanh thu

// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if (categoryCreateForm) {
	const validation = new JustValidate("#category-create-form");

	validation
		.addField("#name", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên danh mục!",
			},
		])
		.onSuccess((event) => {
			const name = event.target.name.value;
			const parent = event.target.parent.value;
			const position = event.target.position.value;
			const status = event.target.status.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
			}
			const description = tinymce.get("description").getContent();
			// Tạo FormData
			const formData = new FormData();
			formData.append("name", name);
			formData.append("parent", parent);
			formData.append("position", position);
			formData.append("status", status);
			formData.append("avatar", avatar);
			formData.append("description", description);

			fetch(`/${pathAdmin}/category/create`, {
				method: "POST",
				body: formData,
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code == "error") {
						alert(data.message);
					}

					if (data.code == "success") {
						window.location.href = `/${pathAdmin}/category/list`;
					}
				});

			// console.log(name);
			// console.log(parent);
			// console.log(position);
			// console.log(status);
			// console.log(avatar);
			// console.log(description);
		});
}
// End Category Create Form

// Category Edit Form
const categoryEditForm = document.querySelector("#category-edit-form");
if (categoryEditForm) {
	const validation = new JustValidate("#category-edit-form");

	validation
		.addField("#name", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên danh mục!",
			},
		])
		.onSuccess((event) => {
			const id = event.target.id.value;
			const name = event.target.name.value;
			const parent = event.target.parent.value;
			const position = event.target.position.value;
			const status = event.target.status.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
			}
			const description = tinymce.get("description").getContent();
			// Tạo FormData
			const formData = new FormData();
			formData.append("name", name);
			formData.append("parent", parent);
			formData.append("position", position);
			formData.append("status", status);
			formData.append("avatar", avatar);
			formData.append("description", description);

			fetch(`/${pathAdmin}/category/edit/${id}`, {
				method: "PATCH",
				body: formData,
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code == "error") {
						alert(data.message);
					}

					if (data.code == "success") {
						window.location.reload();
					}
				});

			// console.log(name);
			// console.log(parent);
			// console.log(position);
			// console.log(status);
			// console.log(avatar);
			// console.log(description);
		});
}
// End Category Create Form

// Tour Create Form
const tourCreateForm = document.querySelector("#tour-create-form");
if (tourCreateForm) {
	const validation = new JustValidate("#tour-create-form");

	validation
		.addField("#name", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên tour!",
			},
		])
		.onSuccess((event) => {
			const name = event.target.name.value;
			const category = event.target.category.value;
			const position = event.target.position.value;
			const status = event.target.status.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
			}
			const priceAdult = event.target.priceAdult.value;
			const priceChildren = event.target.priceChildren.value;
			const priceBaby = event.target.priceBaby.value;
			const priceNewAdult = event.target.priceNewAdult.value;
			const priceNewChildren = event.target.priceNewChildren.value;
			const priceNewBaby = event.target.priceNewBaby.value;
			const stockAdult = event.target.stockAdult.value;
			const stockChildren = event.target.stockChildren.value;
			const stockBaby = event.target.stockBaby.value;
			const locations = [];
			const time = event.target.time.value;
			const vehicle = event.target.vehicle.value;
			const departureDate = event.target.departureDate.value;
			const information = tinymce.get("information").getContent();
			const schedules = [];

			// locations
			const listElementLocation = tourCreateForm.querySelectorAll(
				'input[name="locations"]:checked',
			);
			listElementLocation.forEach((input) => {
				locations.push(input.value);
			});
			// End locations

			// schedules
			const listElementScheduleItem = tourCreateForm.querySelectorAll(
				".inner-schedule-item",
			);
			listElementScheduleItem.forEach((scheduleItem) => {
				const input = scheduleItem.querySelector("input");
				const title = input.value;

				const textarea = scheduleItem.querySelector("textarea");
				const idTextarea = textarea.id;
				const description = tinymce.get(idTextarea).getContent();

				schedules.push({
					title: title,
					description: description,
				});
			});
			// End schedules

			console.log(name);
			console.log(category);
			console.log(position);
			console.log(status);
			console.log(avatar);
			console.log(priceAdult);
			console.log(priceChildren);
			console.log(priceBaby);
			console.log(priceNewAdult);
			console.log(priceNewChildren);
			console.log(priceNewBaby);
			console.log(stockAdult);
			console.log(stockChildren);
			console.log(stockBaby);
			console.log(locations);
			console.log(time);
			console.log(vehicle);
			console.log(departureDate);
			console.log(information);
			console.log(schedules);

			// Tạo formData
			const formData = new FormData();
			formData.append("name", name);
			formData.append("category", category);
			formData.append("position", position);
			formData.append("status", status);
			formData.append("avatar", avatar);
			formData.append("priceAdult", priceAdult);
			formData.append("priceChildren", priceChildren);
			formData.append("priceBaby", priceBaby);
			formData.append("priceNewAdult", priceNewAdult);
			formData.append("priceNewChildren", priceNewChildren);
			formData.append("priceNewBaby", priceNewBaby);
			formData.append("stockAdult", stockAdult);
			formData.append("stockChildren", stockChildren);
			formData.append("stockBaby", stockBaby);
			formData.append("locations", JSON.stringify(locations));
			formData.append("time", time);
			formData.append("vehicle", vehicle);
			formData.append("departureDate", departureDate);
			formData.append("information", information);
			formData.append("schedules", JSON.stringify(schedules));
			fetch(`/${pathAdmin}/tour/create`, {
				method: "POST",
				body: formData,
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code == "error") {
						alert(data.message);
					}

					if (data.code == "success") {
						window.location.href = `/${pathAdmin}/tour/list`;
					}
				});
		});
}
// End Tour Create Form

// Tour Edit Form
const tourEditForm = document.querySelector("#tour-edit-form");
if (tourEditForm) {
	const validation = new JustValidate("#tour-edit-form");

	validation
		.addField("#name", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên tour!",
			},
		])
		.onSuccess((event) => {
			const id = event.target.id.value;
			const name = event.target.name.value;
			const category = event.target.category.value;
			const position = event.target.position.value;
			const status = event.target.status.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
				const elementImageDefault =
					event.target.avatar.closest("[image-default]");
				const imageDefault = elementImageDefault.getAttribute("image-default");
				if (imageDefault.includes(avatar.name)) {
					avatar = null;
				}
			}
			const priceAdult = event.target.priceAdult.value;
			const priceChildren = event.target.priceChildren.value;
			const priceBaby = event.target.priceBaby.value;
			const priceNewAdult = event.target.priceNewAdult.value;
			const priceNewChildren = event.target.priceNewChildren.value;
			const priceNewBaby = event.target.priceNewBaby.value;
			const stockAdult = event.target.stockAdult.value;
			const stockChildren = event.target.stockChildren.value;
			const stockBaby = event.target.stockBaby.value;
			const locations = [];
			const time = event.target.time.value;
			const vehicle = event.target.vehicle.value;
			const departureDate = event.target.departureDate.value;
			const information = tinymce.get("information").getContent();
			const schedules = [];

			// locations
			const listElementLocation = tourEditForm.querySelectorAll(
				'input[name="locations"]:checked',
			);
			listElementLocation.forEach((input) => {
				locations.push(input.value);
			});
			// End locations

			// schedules
			const listElementScheduleItem = tourEditForm.querySelectorAll(
				".inner-schedule-item",
			);
			listElementScheduleItem.forEach((scheduleItem) => {
				const input = scheduleItem.querySelector("input");
				const title = input.value;

				const textarea = scheduleItem.querySelector("textarea");
				const idTextarea = textarea.id;
				const description = tinymce.get(idTextarea).getContent();

				schedules.push({
					title: title,
					description: description,
				});
			});
			// End schedules

			// Tạo FormData
			const formData = new FormData();
			formData.append("name", name);
			formData.append("category", category);
			formData.append("position", position);
			formData.append("status", status);
			formData.append("avatar", avatar);
			formData.append("priceAdult", priceAdult);
			formData.append("priceChildren", priceChildren);
			formData.append("priceBaby", priceBaby);
			formData.append("priceNewAdult", priceNewAdult);
			formData.append("priceNewChildren", priceNewChildren);
			formData.append("priceNewBaby", priceNewBaby);
			formData.append("stockAdult", stockAdult);
			formData.append("stockChildren", stockChildren);
			formData.append("stockBaby", stockBaby);
			formData.append("locations", JSON.stringify(locations));
			formData.append("time", time);
			formData.append("vehicle", vehicle);
			formData.append("departureDate", departureDate);
			formData.append("information", information);
			formData.append("schedules", JSON.stringify(schedules));

			fetch(`/${pathAdmin}/tour/edit/${id}`, {
				method: "PATCH",
				body: formData,
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code == "error") {
						alert(data.message);
					}

					if (data.code == "success") {
						window.location.reload();
					}
				});
		});
}
// End Tour Edit Form

// Order Edit Form
const orderEditForm = document.querySelector("#order-edit-form");
if (orderEditForm) {
	const validation = new JustValidate("#order-edit-form");

	validation
		.addField("#fullName", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập họ tên!",
			},
			{
				rule: "minLength",
				value: 5,
				errorMessage: "Họ tên phải có ít nhất 5 ký tự!",
			},
			{
				rule: "maxLength",
				value: 50,
				errorMessage: "Họ tên không được vượt quá 50 ký tự!",
			},
		])
		.addField("#phone", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập số điện thoại!",
			},
			{
				rule: "customRegexp",
				value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
				errorMessage: "Số điện thoại không đúng định dạng!",
			},
		])
		.onSuccess((event) => {
			const fullName = event.target.fullName.value;
			const phone = event.target.phone.value;
			const note = event.target.note.value;
			const paymentMethod = event.target.paymentMethod.value;
			const paymentStatus = event.target.paymentStatus.value;
			const status = event.target.status.value;

			console.log(fullName);
			console.log(phone);
			console.log(note);
			console.log(paymentMethod);
			console.log(paymentStatus);
			console.log(status);
		});
}
// End Order Edit Form

// Setting Website Info Form
const settingWebsiteInfoForm = document.querySelector(
	"#setting-website-info-form",
);
if (settingWebsiteInfoForm) {
	const validation = new JustValidate("#setting-website-info-form");

	validation
		.addField("#websiteName", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên website!",
			},
		])
		.addField("#email", [
			{
				rule: "email",
				errorMessage: "Email không đúng định dạng!",
			},
		])
		.onSuccess((event) => {
			const websiteName = event.target.websiteName.value;
			const phone = event.target.phone.value;
			const email = event.target.email.value;
			const address = event.target.address.value;
			const logos = filePond.logo.getFiles();
			let logo = null;
			if (logos.length > 0) {
				logo = logos[0].file;
			}
			const favicons = filePond.favicon.getFiles();
			let favicon = null;
			if (favicons.length > 0) {
				favicon = favicons[0].file;
			}

			console.log(websiteName);
			console.log(phone);
			console.log(email);
			console.log(address);
			console.log(logo);
			console.log(favicon);
		});
}
// End Setting Website Info Form

// Setting Account Admin Create Form
const settingAccountAdminCreateForm = document.querySelector(
	"#setting-account-admin-create-form",
);
if (settingAccountAdminCreateForm) {
	const validation = new JustValidate("#setting-account-admin-create-form");

	validation
		.addField("#fullName", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập họ tên!",
			},
			{
				rule: "minLength",
				value: 5,
				errorMessage: "Họ tên phải có ít nhất 5 ký tự!",
			},
			{
				rule: "maxLength",
				value: 50,
				errorMessage: "Họ tên không được vượt quá 50 ký tự!",
			},
		])
		.addField("#email", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập email!",
			},
			{
				rule: "email",
				errorMessage: "Email không đúng định dạng!",
			},
		])
		.addField("#phone", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập số điện thoại!",
			},
			{
				rule: "customRegexp",
				value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
				errorMessage: "Số điện thoại không đúng định dạng!",
			},
		])
		.addField("#positionCompany", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập chức vụ!",
			},
		])
		.addField("#password", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập mật khẩu!",
			},
			{
				validator: (value) => value.length >= 8,
				errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự!",
			},
			{
				validator: (value) => /[A-Z]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
			},
			{
				validator: (value) => /[a-z]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái thường!",
			},
			{
				validator: (value) => /\d/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ số!",
			},
			{
				validator: (value) => /[@$!%*?&]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
			},
		])
		.onSuccess((event) => {
			const fullName = event.target.fullName.value;
			const email = event.target.email.value;
			const phone = event.target.phone.value;
			const role = event.target.role.value;
			const positionCompany = event.target.positionCompany.value;
			const status = event.target.status.value;
			const password = event.target.password.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
			}

			console.log(fullName);
			console.log(email);
			console.log(phone);
			console.log(role);
			console.log(positionCompany);
			console.log(status);
			console.log(password);
			console.log(avatar);
		});
}
// End Setting Account Admin Create Form

// Setting Role Create Form
const settingRoleCreateForm = document.querySelector(
	"#setting-role-create-form",
);
if (settingRoleCreateForm) {
	const validation = new JustValidate("#setting-role-create-form");

	validation
		.addField("#name", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập tên nhóm quyền!",
			},
		])
		.onSuccess((event) => {
			const name = event.target.name.value;
			const description = event.target.description.value;
			const permissions = [];

			// permissions
			const listElementPermission = settingRoleCreateForm.querySelectorAll(
				'input[name="permissions"]:checked',
			);
			listElementPermission.forEach((input) => {
				permissions.push(input.value);
			});
			// End permissions

			console.log(name);
			console.log(description);
			console.log(permissions);
		});
}
// End Setting Role Create Form

// Profile Edit Form
const profileEditForm = document.querySelector("#profile-edit-form");
if (profileEditForm) {
	const validation = new JustValidate("#profile-edit-form");

	validation
		.addField("#fullName", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập họ tên!",
			},
			{
				rule: "minLength",
				value: 5,
				errorMessage: "Họ tên phải có ít nhất 5 ký tự!",
			},
			{
				rule: "maxLength",
				value: 50,
				errorMessage: "Họ tên không được vượt quá 50 ký tự!",
			},
		])
		.addField("#email", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập email!",
			},
			{
				rule: "email",
				errorMessage: "Email không đúng định dạng!",
			},
		])
		.addField("#phone", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập số điện thoại!",
			},
			{
				rule: "customRegexp",
				value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
				errorMessage: "Số điện thoại không đúng định dạng!",
			},
		])
		.onSuccess((event) => {
			const fullName = event.target.fullName.value;
			const email = event.target.email.value;
			const phone = event.target.phone.value;
			const avatars = filePond.avatar.getFiles();
			let avatar = null;
			if (avatars.length > 0) {
				avatar = avatars[0].file;
			}

			console.log(fullName);
			console.log(email);
			console.log(phone);
			console.log(avatar);
		});
}
// End Profile Edit Form

// Profile Change Password Form
const profileChangePasswordForm = document.querySelector(
	"#profile-change-password-form",
);
if (profileChangePasswordForm) {
	const validation = new JustValidate("#profile-change-password-form");

	validation
		.addField("#password", [
			{
				rule: "required",
				errorMessage: "Vui lòng nhập mật khẩu!",
			},
			{
				validator: (value) => value.length >= 8,
				errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự!",
			},
			{
				validator: (value) => /[A-Z]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
			},
			{
				validator: (value) => /[a-z]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái thường!",
			},
			{
				validator: (value) => /\d/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một chữ số!",
			},
			{
				validator: (value) => /[@$!%*?&]/.test(value),
				errorMessage: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
			},
		])
		.addField("#confirmPassword", [
			{
				rule: "required",
				errorMessage: "Vui lòng xác nhận mật khẩu!",
			},
			{
				validator: (value, fields) => {
					const password = fields["#password"].elem.value;
					return value == password;
				},
				errorMessage: "Mật khẩu xác nhận không khớp!",
			},
		])
		.onSuccess((event) => {
			const password = event.target.password.value;
			console.log(password);
		});
}
// End Profile Change Password Form

// Sider
const sider = document.querySelector(".sider");
if (sider) {
	const pathNameCurrent = window.location.pathname;
	const splitPathNameCurrent = pathNameCurrent.split("/");
	const menuList = sider.querySelectorAll("a");
	menuList.forEach((item) => {
		const href = item.href;
		// console.log(item.href);
		const pathName = new URL(href).pathname;
		// console.log(pathName);
		const splitPathName = pathName.split("/");
		if (
			splitPathNameCurrent[1] == splitPathName[1] &&
			splitPathNameCurrent[2] == splitPathName[2]
		) {
			item.classList.add("active");
		}
	});
}
// End Sider

// Logout

const buttonLogout = document.querySelector(".sider .inner-logout");

if (buttonLogout) {
	buttonLogout.addEventListener("click", () => {
		fetch(`/${pathAdmin}/account/logout`, {
			method: "POST",
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.code === "success") {
					window.location.href = `/${pathAdmin}/account/login`;
				}
			});
	});
}

// End logout

// Alert
const alertTime = document.querySelector("[alert-time]");
if (alertTime) {
	let time = alertTime.getAttribute("alert-time");
	time = time ? parseInt(time) : 4000;
	setTimeout(() => {
		alertTime.remove(); // Xóa phần tử khỏi giao diện
	}, time);
}
// End Alert

// Button Delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
	listButtonDelete.forEach((button) => {
		button.addEventListener("click", () => {
			const dataApi = button.getAttribute("data-api");
			fetch(dataApi, {
				method: "PATCH",
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code === "error") {
						alert(data.message);
					}
					if (data.code === "success") {
						window.location.reload();
					}
				});
		});
	});
}
// End Button Delete

// Filter status
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
	const url = new URL(window.location.href);

	// lang nghe thay doi lua chon
	filterStatus.addEventListener("change", () => {
		const value = filterStatus.value;
		if (value) {
			url.searchParams.set("status", value);
		} else {
			url.searchParams.delete("status");
		}
		window.location.href = url.href;
	});
	const valueCurrent = url.searchParams.get("status");
	if (valueCurrent) {
		filterStatus.value = valueCurrent;
	}
}
// End Filter status

// Filter created by
const filterCreatedBy = document.querySelector("[filter-created-by]");
if (filterCreatedBy) {
	const url = new URL(window.location.href);

	// lang nghe thay doi lua chon
	filterCreatedBy.addEventListener("change", () => {
		const value = filterCreatedBy.value;
		if (value) {
			url.searchParams.set("createdBy", value);
		} else {
			url.searchParams.delete("createdBy");
		}
		window.location.href = url.href;
	});
	const valueCurrent = url.searchParams.get("createdBy");
	if (valueCurrent) {
		filterCreatedBy.value = valueCurrent;
	}
}
// End Filter created by

// Filter start date
const filterStartDate = document.querySelector("[filter-start-date]");
if (filterStartDate) {
	const url = new URL(window.location.href);

	// lang nghe thay doi lua chon
	filterStartDate.addEventListener("change", () => {
		const value = filterStartDate.value;
		if (value) {
			url.searchParams.set("startDate", value);
		} else {
			url.searchParams.delete("startDate");
		}
		window.location.href = url.href;
	});
	// hien thi mac dinh
	const valueCurrent = url.searchParams.get("startDate");
	if (valueCurrent) {
		filterStartDate.value = valueCurrent;
	}
}
// End Filter start date

// Filter end date
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterEndDate) {
	const url = new URL(window.location.href);

	// lang nghe thay doi lua chon
	filterEndDate.addEventListener("change", () => {
		const value = filterEndDate.value;
		if (value) {
			url.searchParams.set("endDate", value);
		} else {
			url.searchParams.delete("endDate");
		}
		window.location.href = url.href;
	});
	// hien thi mac dinh
	const valueCurrent = url.searchParams.get("endDate");
	if (valueCurrent) {
		filterEndDate.value = valueCurrent;
	}
}
// End Filter end date

// Filter reset
const filterRest = document.querySelector("[filter-reset]");
if (filterRest) {
	const url = new URL(window.location.href);

	filterRest.addEventListener("click", () => {
		url.search = "";
		window.location.href = url.href;
	});
}
// End filter reset

// Check all
const checkAll = document.querySelector("[check-all]");
if (checkAll) {
	checkAll.addEventListener("click", () => {
		const listCheckItem = document.querySelectorAll("[check-item]");
		listCheckItem.forEach((item) => {
			item.checked = checkAll.checked;
		});
	});
}
// End check all

// Change multi
const changeMulti = document.querySelector("[change-multi]");
if (changeMulti) {
	const dataApi = changeMulti.getAttribute("data-api");
	const select = changeMulti.querySelector("select");
	const button = changeMulti.querySelector("button");
	button.addEventListener("click", () => {
		const option = select.value;
		const listInputChecked = document.querySelectorAll("[check-item]:checked");
		if (option && listInputChecked.length > 0) {
			const ids = [];
			listInputChecked.forEach((item) => {
				const id = item.getAttribute("check-item");
				ids.push(id);
			});
			const dataFinal = {
				option: option,
				ids: ids,
			};
			fetch(dataApi, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataFinal),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.code === "error") {
						alert(message);
					}
					if (data.code === "success") {
						window.location.reload();
					}
				});
		} else {
			alert("Vui lòng chọn option và bản ghi muốn t hực hiện !");
		}
	});
}
// End change multi

// Search
const search = document.querySelector("[search]");
if (search) {
	const url = new URL(window.location.href);
	// lang nghe phim dang go
	search.addEventListener("keyup", (event) => {
		if (event.code === "Enter") {
			const value = search;
			if (value) {
				url.searchParams.set("keyword", value.value.trim());
			} else {
				url.searchParams.delete("keyword");
			}
			window.location.href = url.href;
		}
	});
	// hien thi mac dinh
	const valueCurrent = url.searchParams.get("keyword");
	if (valueCurrent) {
		search.value = valueCurrent;
	}
}
// End search

// Pagination
const pagination = document.querySelector("[pagination]");
if (pagination) {
	const url = new URL(window.location.href);

	// lang nghe thay doi lua chon
	pagination.addEventListener("change", () => {
		const value = pagination.value;
		if (value) {
			url.searchParams.set("page", value);
		} else {
			url.searchParams.delete("page");
		}
		window.location.href = url.href;
	});
	const valueCurrent = url.searchParams.get("page");
	if (valueCurrent) {
		pagination.value = valueCurrent;
	}
}
// End Pagination
