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
	res.render("Trainer/signin");
};
const postLogin = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from trainer WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/trainer/signin");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createTokenTrainer(
							result[0].trainer_id
						);
						res.cookie("token_trainer", generateToken, {
							httpOnly: true,
						});
						res.redirect("/trainer/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						res.redirect("/trainer/signin");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/trainer/signin");
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


	const rate = Number(completion_rate).toFixed(2);

	res.render("Trainer/dashboard", {
		title: "Trainer Dashboard",
		tasks,
		active_client,
		task_created,
		rate,
		clients,
	});
};

const getClient = async (req, res) => {
	const trainer_id = res.locals.id;

	const clientData = await queryParam(
		"SELECT membership.*, client.fullname, client.username FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id INNER JOIN client ON client.id = membership.client_id WHERE membership.trainer_id = ? AND membership_status = 'Activated' AND payment_status = 'Paid' ORDER BY membership.membership_id;",
		[trainer_id]
	);

	res.render("Trainer/client", {
		title: "Trainer - Client",
		clientData,
	});
};

const getClientView = async (req, res) => {
	const client_username = req.params.username;
	const trainer_id = res.locals.id;
	const tasks = await queryParam(
		`SELECT task.task_id, task.description, task.status  FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN task ON task.client_id = membership.client_id LEFT JOIN client ON client.id = membership.client_id WHERE client.username = '${client_username}' AND trainer.trainer_id = ? AND membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' ORDER BY task.task_id DESC;`,
		[trainer_id]
	);

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

	

	res.render("Trainer/client_view", {
		title: "View Client Profile",
		profileData,
		progress,
		done,
		cancelled,
		tasks,
	});
};
const getTask = async (req, res) => {
	const trainer_id = res.locals.id;
	const tasks = await queryParam(
		"SELECT task.task_id, membership.membership_service, membership.membership_plan, membership.join_date, task.description,task.status, client.fullname AS client_name FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN task ON task.client_id = membership.client_id LEFT JOIN client ON client.id = membership.client_id WHERE task.trainer_id = ? AND membership_status = 'Activated' AND payment_status = 'Paid' ORDER BY task.task_id DESC",
		[trainer_id]
	);

	res.render("Trainer/task", {
		title: "Trainer Task",
		tasks,
	});
};

const addTask = async (req, res) => {
	const trainer_id = res.locals.id;
	const clients = await queryParam(
		"SELECT client.fullname AS client_name,client.id,membership.membership_service  FROM membership INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id LEFT JOIN client ON client.id = membership.client_id WHERE trainer.trainer_id = ? AND membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' ORDER BY membership.membership_id;",
		[trainer_id]
	);

	res.render("Trainer/add_task", {
		title: "Trainer Add Task",
		clients,
	});
};

const postAddTask = (req, res) => {
	const trainer_id = res.locals.id;
	const { client_id, description, date } = req.body;

	const data = {
		client_id,
		description,
		trainer_id,
		status: "In Progress",
		date: new Date(date).toLocaleDateString("en-US"),
		time: time(),
	};

	db.query("INSERT INTO task SET ?", data, (err, result) => {
		if (err) {
			console.error("Error inserting task:", err);
			req.flash("error", "Error inserting tasks");
			res.redirect("/trainer/add_task");
		} else {
			req.flash("success_msg", "Successfully added task");
			res.redirect("/trainer/add_task");
		}
	});
};

const getEditTask = async (req, res) => {
	const task_id = req.params.task_id;

	const task = (
		await queryParam("SELECT * FROM task WHERE task_id = ?", [task_id])
	)[0];

	res.render("Trainer/edit_task", {
		title: "Edit Task",
		task,
	});
};

const postEditTask = (req, res) => {
	const { description, status, taskdate, tasktime, task_id } = req.body;

	const data = {
		description,
		status,
		date: taskdate
			.split("-")
			.slice(1)
			.concat("2024-02-09".split("-").slice(0, 1))
			.join("/"),
		time: new Date(`1970-01-01T${tasktime}:00`).toLocaleTimeString([], {
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: true,
		}),
	};

	db.query(
		"UPDATE task SET ? WHERE task_id = ?",
		[data, task_id],
		(err, result) => {
			if (err) {
				console.error("Error updating task:", err);
				req.flash("error", "Error updating task");
				res.redirect(`/trainer/edit_task/${task_id}`);
			} else {
				req.flash("success_msg", "Task updated successfully");
				res.redirect(`/trainer/edit_task/${task_id}`);
			}
		}
	);
};

const deleteTask = async (req, res) => {
	const taskId = req.body.taskId;

	// Assuming you have a 'tasks' table
	const deleteQuery = "DELETE FROM task WHERE task_id = ?";

	db.query(deleteQuery, [taskId], (deleteErr, deleteResult) => {
		if (deleteErr) {
			console.error("Error deleting task:", deleteErr);
			return res.status(500).json({
				status: "error",
				message: "Error deleting task",
			});
		}

		if (deleteResult.affectedRows === 0) {
			return res.status(404).json({
				status: "error",
				message: "Task not found for the given task id and client id",
			});
		}

		// You can include additional logic or messages here if needed

		return res.status(200).json({
			status: "success",
			message: "Task has been deleted",
		});
	});
};

const getAnnouncement = async (req,res) => {
	const announcements = (
		await zeroParam(
			"SELECT * FROM announcement WHERE client_id IS NULL ORDER BY `announcement`.`announcement_id` DESC",
		)
	);

	
	res.render("Trainer/announcement", {title: "Announcement List",announcements})
}

const getProfile = async (req, res) => {
	const trainer_id = res.locals.id;
	const profileData = (
		await queryParam("SELECT * FROM trainer WHERE trainer_id = ?", [
			trainer_id,
		])
	)[0];

	res.render("Trainer/profile", {
		title: "Trainer Profile",
		profileData,
	});
};

const updateProfile = (req, res) => {
	const trainer_id = res.locals.id;
	const { fullName, age, gender, email, phonenumber, address } = req.body;

	const data = {
		fullName,
		age,
		gender,
		email,
		phonenumber,
		address,
	};

	db.query(
		"UPDATE trainer SET ? WHERE trainer_id = ?",
		[data, trainer_id],
		(err, result) => {
			if (err) {
				console.error("Error updating profile:", err);
				req.flash("error", "Error updating profile");
				res.redirect("/trainer/profile");
			} else {
				req.flash("success_msg", "Profile updated successfully");
				res.redirect("/trainer/profile");
			}
		}
	);
};

const getLogout = (req, res) => {
	res.clearCookie("token_trainer");
	res.redirect("/trainer/signin");
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
	getAnnouncement,
	getProfile,
	updateProfile,
	getLogout,
};
