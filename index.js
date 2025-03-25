const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DATABASE);

const { homeController } = require("./controllers/client/home.controller");
const tourController = require("./controllers/client/tour.controller");
const PORT = process.env.PORT || 3000;

// Thiết lập thư mục chứa file tĩnh của Fontend:
app.use(express.static(path.join(__dirname, "public")));

// Thiết lập views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// route + controller
app.get("/", homeController);

app.get("/tours", tourController.list);
app.get("/tours/del", tourController.del);
app.get("/tours/create", tourController.create);

app.listen(PORT, () => {
	console.log(`Website is running at ${PORT}`);
});
