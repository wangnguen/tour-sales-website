const cart = (req, res) => {
	res.render("client/pages/cart", {
		titlePage: "Giỏ hàng",
	});
};
module.exports = { cart };
