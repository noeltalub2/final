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
				res.redirect("/t/signin");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createTokenTrainer(
							result[0].id
						);
						res.cookie("token_admin", generateToken, {
							httpOnly: true,
						});
						res.redirect("/Admin/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						res.redirect("/Admin/signin");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/Admin/signin");
				}
			}
		});
	} catch {
		throw err;
	}
};

const getDashboard = async (req, res) => {
	const trainer_id = res.locals.id;
	const tasks = await queryParam(
		`SELECT task.task_id, task.date, membership.membership_service, membership.membership_plan, task.description, task.status, client.fullname AS client_name FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN task ON task.client_id = membership.client_id LEFT JOIN client ON client.id = membership.client_id WHERE task.trainer_id = ? AND membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' AND task.date = '${date()}' ORDER BY task.task_id DESC LIMIT 5;`,
		[trainer_id]
	);
	const active_client = (
		await queryParam(
			"SELECT COUNT(*) AS count FROM membership WHERE trainer_id = ? AND membership_status = 'Activated' AND payment_status = 'Paid';",
			[trainer_id]
		)
	)[0].count;

	const task_created = (
		await queryParam(
			"SELECT COUNT(*) AS count FROM task WHERE trainer_id = ?;",
			[trainer_id]
		)
	)[0].count;

	const completion_rate = (
		await queryParam(
			"SELECT IFNULL(SUM(CASE WHEN task.status = 'Done' THEN 1 ELSE 0 END), 0) AS completed_tasks, COUNT(*) AS total_tasks, IFNULL((SUM(CASE WHEN task.status = 'Done' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) AS completion_rate FROM task WHERE trainer_id = ?;",
			[trainer_id]
		)
	)[0].completion_rate;

	const clients = await queryParam(
		`SELECT membership.membership_service, membership.membership_plan, membership.join_date, client.fullname AS client_name FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN client ON client.id = membership.client_id WHERE membership.trainer_id = ? AND membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' ORDER BY membership.membership_id DESC LIMIT 5;`,
		[trainer_id]
	);

	console.log(clients);
	const rate = Number(completion_rate).toFixed(2);

	res.render("Admin/dashboard", {
		title: "Trainer Dashboard",
		tasks,
		active_client,
		task_created,
		rate,
		clients,
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
	getClientView,
	getTask,
	addTask,
	postAddTask,
	getEditTask,
	postEditTask,
	deleteTask,
	getProfile,
	updateProfile,
	getLogout,
};
