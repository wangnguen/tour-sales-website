const express = require("express");
const app = express();
const path = require("path");

const PORT = 3000;

// Thiết lập views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// route + controller
app.get("/", (req, res) => {
	res.render("client/pages/home", {
		pageTitle: "Trang chủ",
	});
});

app.get("/tour", (req, res) => {
	res.render("client/pages/tour_list", {
		pageTitle: "Danh sách tour",
	});
});

app.listen(PORT, () => {
	console.log(`Website is running at ${PORT}`);
});
