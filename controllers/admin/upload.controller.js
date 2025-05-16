const imagePost = async (req, res) => {
	res.json({
		location: req.file.path,
	});
};
module.exports = { imagePost };
