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

const getClientView = async (req, res) => {
	const client_username = req.params.username;
	// const trainer_id = res.locals.id;
	// const tasks = await queryParam(
	// 	`SELECT task.task_id, membership.membership_service, membership.membership_plan, membership.join_date, task.description, task.status, client.fullname AS client_name FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN task ON task.client_id = membership.client_id LEFT JOIN client ON client.id = membership.client_id WHERE client.username = '${client_username}' AND trainer.trainer_id = ? AND membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' ORDER BY task.task_id DESC;`,
	// 	[trainer_id]
	// );

	const profileData = (
		await queryParam("SELECT * FROM client WHERE username = ?", [
			client_username,
		])
	)[0];
	const progress = (
		await queryParam(
			"SELECT COUNT(status) AS count FROM task WHERE client_id = (SELECT id FROM client WHERE username = ?) AND status = 'In Progress'",
			[client_username]
		)
	)[0].count;
	const done = (
		await queryParam(
			"SELECT COUNT(status) AS count FROM task WHERE client_id = (SELECT id FROM client WHERE username = ?) AND status = 'Done'",
			[client_username]
		)
	)[0].count;
	const cancelled = (
		await queryParam(
			"SELECT COUNT(status) AS count FROM task WHERE client_id = (SELECT id FROM client WHERE username = ?) AND status = 'Cancelled'",
			[client_username]
		)
	)[0].count;

	res.render("Admin/client_view", {
		title: "Edit Client Profile",
		profileData,
		progress,
		done,
		cancelled,
	});
};

const updateProfile = (req, res) => {
	const {
		fullName,
		age,
		gender,
		email,
		phonenumber,
		address,
		height,
		weight,
		username,
	} = req.body;

	const data = {
		fullName,
		age,
		gender,
		email,
		phonenumber,
		address,
		height,
		weight,
	};

	db.query(
		"UPDATE client SET ? WHERE username = ?",
		[data, username],
		(err, result) => {
			if (err) {
				console.error("Error updating profile:", err);
				req.flash("error", "Error updating profile");
				res.redirect(`/admin/client/${username}`);
			} else {
				req.flash("success_msg", "Profile updated successfully");
				res.redirect(`/admin/client/${username}`);
			}
		}
	);
};
const deleteClient = async (req, res) => {
	const username = req.body.userId;
	const id = (
		await queryParam("SELECT id FROM client WHERE username = ?", [username])
	)[0].id;
	try {
		const attendance = (
			await queryParam("DELETE FROM attendance WHERE client_id = ?", [id])
		)[0];

		const task = (
			await queryParam("DELETE FROM task WHERE client_id = ?", [id])
		)[0];
		const membership = (
			await queryParam("DELETE FROM membership WHERE client_id = ?", [id])
		)[0];

		const profile = (
			await queryParam("DELETE FROM client WHERE id = ?", [id])
		)[0];
		res.status(200).json({
			status: "success",
			message: "Client Deleted Successfully",
		});
	} catch (err) {
		res.status(200).json({
			status: "error",
			message: "There was an error deleting the client",
		});
	}
};

const getEquipment = async (req, res) => {
	const equipment = await zeroParam(
		"SELECT * FROM equipment ORDER BY id DESC"
	);

	res.render("Admin/equipment", {
		title: "Admin - Equipment Details",
		equipment,
	});
};

const deleteEquipment = async (req, res) => {
	const equipmentId = req.body.equipmentId;

	try {
		const equipment = (
			await queryParam("DELETE FROM equipment WHERE id = ?", [
				equipmentId,
			])
		)[0];
		res.status(200).json({
			status: "success",
			message: "Equipment Deleted Successfully",
		});
	} catch (err) {
		res.status(200).json({
			status: "error",
			message: "There was an error deleting the equipment",
		});
	}
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
	getClientView,
	updateProfile,
	deleteClient,
	getEquipment,
	deleteEquipment,
	getLogout,
};
