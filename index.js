const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
	res.send("Trang chủ");
});

app.get("/tour", (req, res) => {
	res.send("Trang tour");
});

app.listen(PORT, () => {
	console.log(`Website is running at ${PORT}`);
});
