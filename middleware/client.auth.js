const { verify } = require("jsonwebtoken");
const db = require("../database/db");

const queryId = async (id) => {
	try {
		return (
			await db
				.promise()
				.query("SELECT id FROM client WHERE id = ?", [id])
		)[0];
	} catch (err) {
		throw err;
	}
};
const requireAuth = async (req, res, next) => {
	const token = req.cookies.token_client;

	if (token) {
		verify(token, process.env.JWT_SECRET_KEY, async (err, rset) => {
			if (err) res.redirect("/unauthorized");
			else {
			
				0 === (await queryId(rset.id)).length
					? res.redirect("/unauthorized")
					: ((res.locals.id = rset.id), next());
			}
		});
	} else res.redirect("/unauthorized");
};

const forwardAuth = async (req, res, next) => {
	const token = req.cookies.token_client;
	if (token) {
		verify(token, process.env.JWT_SECRET_KEY, async (err, rset) => {
			if (err) next();
			else {
				0 === (await queryId(rset.id)).length
					? next()
					: ((res.locals.id = rset.id),
					  res.redirect("/dashboard"));
			}
		});
	} else next();
};

module.exports = { requireAuth, forwardAuth };
