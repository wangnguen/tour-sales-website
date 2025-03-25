const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DATABASE);

const PORT = process.env.PORT || 3000;
const clientRoutes = require("./routes/client/index.route");

// Thiết lập thư mục chứa file tĩnh của Fontend:
app.use(express.static(path.join(__dirname, "public")));

// Thiết lập views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Thiết lập đường dẫn:
app.use("/", clientRoutes);

app.listen(PORT, () => {
	console.log(`Website is running at ${PORT}`);
});
