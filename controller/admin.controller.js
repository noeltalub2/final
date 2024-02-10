const bcrypt = require("bcrypt");
const fs = require("fs");
const { createTokenClient, createTokenTrainer } = require("../utils/token");
const { date, date_time } = require("../utils/date");
const { time, convertDate } = require("../utils/timestamp");

const db = require("../database/db");

const queryParam = async (sql, data) => {
	try {
		return (await db.promise().query(sql, [data]))[0];
	} catch (err) {
		throw err;
	}
};
const zeroParam = async (sql) => {
	try {
		return (await db.promise().query(sql))[0];
	} catch (err) {
		throw err;
	}
};
const getLogin = (req, res) => {
	res.render("Admin/signin");
};
const postLogin = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from admin WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/admin/signin");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createTokenTrainer(result[0].id);
						res.cookie("token_admin", generateToken, {
							httpOnly: true,
						});
						res.redirect("/admin/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						res.redirect("/admin/signin");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/admin/signin");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getDashboard = async (req, res) => {
	const admin_id = res.locals.id;

	res.render("Admin/dashboard", {
		title: "Admin Dashboard",
	});
};

const getClient = async (req, res) => {
	const clientData = await zeroParam(
		"SELECT * FROM client ORDER BY `client`.`id` DESC;"
	);

	res.render("Admin/client", {
		title: "Admin - Manage Client",
		clientData,
	});
};

const getLogout = (req, res) => {
	res.clearCookie("token_admin");
	res.redirect("/admin/signin");
};
module.exports = {
	getLogin,
	postLogin,
	getDashboard,
	getClient,
	getLogout,
};
