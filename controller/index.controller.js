const getError403 = (req,res) => {
	res.render("error403")
}
const getError404 = (req,res) => {
	res.render("error404")
}

module.exports = {
	getError403,
	getError404
};
