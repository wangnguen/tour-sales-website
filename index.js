const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DATABASE);

const Tour = mongoose.model("Tour", { name: String, vehicle: String });

// tours => Tour
// users = User
// products => Product

const PORT = process.env.PORT || 3000;

// Thiết lập thư mục chứa file tĩnh của Fontend:
app.use(express.static(path.join(__dirname, "public")));

// Thiết lập views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// route + controller
app.get("/", (req, res) => {
	res.render("client/pages/home", {
		pageTitle: "Trang chủ",
	});
});

app.get("/tours", async (req, res) => {
	const tourList = await Tour.find({});

	console.log(tourList);
	res.render("client/pages/tour_list", {
		pageTitle: "Danh sách tour",
		tourList: tourList,
	});
});

app.listen(PORT, () => {
	console.log(`Website is running at ${PORT}`);
});
