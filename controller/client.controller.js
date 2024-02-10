const bcrypt = require("bcrypt");
const fs = require("fs");
const { createTokenClient } = require("../utils/token");
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
	res.render("Client/signin");
};
const postLogin = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from client WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createTokenClient(result[0].id);
						res.cookie("token_client", generateToken, {
							httpOnly: true,
						});
						res.redirect("/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						res.redirect("/");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/");
				}
			}
		});
	} catch {
		throw err;
	}
};
const getRegister = (req, res) => {
	res.render("Client/signup");
};
const postRegister = async (req, res) => {
	//Data from the form ../register
	const { fullname, confirmPassword, email, phonenumber, username } =
		req.body;
	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"Select count(*) as `count` from client where username = ?";
	var email_exist = "Select count(*) as `count` from client where email = ?";
	var phone_exist =
		"Select count(*) as `count` from client where phonenumber = ?";
	//Query statement
	const username_count = (await queryParam(username_exist, [username]))[0]
		.count;
	const email_count = (await queryParam(email_exist, [email]))[0].count;
	const phone_count = (await queryParam(phone_exist, [phonenumber]))[0].count;

	//Check if there is duplicate

	if (email_count > 0) {
		errors.push({ msg: "Email is already registered" });
	}
	if (phone_count > 0) {
		errors.push({ msg: "Phonenumber is already registered" });
	}
	if (username_count > 0) {
		errors.push({ msg: "Student number is already registered" });
	}

	//To encrypt the password using hash
	const salt = bcrypt.genSaltSync(15);
	const hash = bcrypt.hashSync(confirmPassword, salt);
	//Data to insert in sql
	var data = {
		fullname,
		email,
		username,
		phonenumber,
		password: hash,
		join_date: date_time(),
	};
	//Add account to database
	var sql = "INSERT INTO client SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			console.log(err);
			res.render("Client/signup", {
				errors,
			});
		} else {
			req.flash("success_msg", "Account created successfully");
			res.redirect("/signup");
		}
	});
};
const getDashboard = async (req, res) => {
	const client_id = res.locals.id;

	const current_tasks = await queryParam(
		`SELECT * FROM task WHERE client_id = ? AND status = 'In Progress' AND date = '${date()}' ORDER BY date DESC LIMIT 5`,
		[client_id]
	);

	const task_done = (
		await queryParam(
			"SELECT COUNT(*) as 'count' FROM task WHERE client_id = ? AND status = 'Done'",
			[client_id]
		)
	)[0];

	const attendance = (
		await queryParam(
			`SELECT 
			attendance.attendance_id,
			attendance.client_id,
			attendance.time_in,
			attendance.time_out,
			attendance.date,
			COUNT(task.status) AS 'task_count'
		FROM attendance
		LEFT JOIN task ON task.client_id = attendance.client_id AND task.status = 'Done' AND attendance.date = task.date
		WHERE attendance.date = '${date()}' AND attendance.client_id = ?
		GROUP BY attendance.attendance_id, attendance.client_id, attendance.time_in, attendance.time_out, attendance.date;
		`,
			[client_id]
		)
	)[0];
	const client_info = (
		await queryParam(`SELECT height, weight FROM client WHERE id = ?`, [
			client_id,
		])
	)[0];
	const membershipData = (
		await queryParam(
			"SELECT membership.*, COUNT(*) AS count, trainer.fullname AS trainer_name FROM membership JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE (membership_status = 'Waiting for Activation' OR membership_status = 'Activated') AND (payment_status = 'Pending' OR payment_status = 'Paid') AND (membership.trainer_id = trainer.trainer_id) AND client_id = ?",
			[client_id]
		)
	)[0];

	const announcement = (
		await queryParam(
			"SELECT * FROM announcement WHERE client_id = ? OR client_id IS NULL ORDER BY `announcement`.`announcement_id` DESC LIMIT 1",
			[client_id]
		)
	)[0];

	res.render("Client/dashboard", {
		title: "Client Dashboard",
		current_tasks,
		task_done,
		attendance,
		client_info,
		membershipData,
		announcement,
	});
};
const getTask = async (req, res) => {
	const client_id = res.locals.id;

	const current_tasks = await queryParam(
		`SELECT * FROM task WHERE client_id = ? AND status = 'In Progress' AND date = '${date()}'  ORDER BY task_id DESC`,
		[client_id]
	);

	const history_tasks = await queryParam(
		"SELECT * FROM task WHERE client_id = ? AND (status = 'Done' OR status = 'Canceled') ORDER BY log_date DESC, log_time DESC;",
		[client_id]
	);

	res.render("Client/task", {
		title: "Client Task",
		current_tasks,
		history_tasks,
	});
};
// const postTask = (req, res) => {
// 	const { description } = req.body;
// 	const client_id = res.locals.id;
// 	const data = {
// 		client_id,
// 		description,
// 		status: "In Progress",
// 		date: date(),
// 		time: time(),
// 	};

// 	db.query("INSERT INTO task SET ?", data, (err, result) => {
// 		if (err) {
// 			console.error("Error inserting task:", err);
// 			req.flash("error", "Error inserting tasks");
// 			res.redirect("/task");
// 		} else {
// 			req.flash("success_msg", "Successfully added task");
// 			res.redirect("/task");
// 		}
// 	});
// };
const postTaskDone = async (req, res) => {
	const taskId = req.body.taskId;
	const clientId = req.body.clientId;
	console.log(taskId);
	console.log(clientId);
	// Assuming you have a 'tasks' table
	const updateQuery =
		"UPDATE task SET status = ?, log_time = ?, log_date = ? WHERE task_id = ? AND client_id = ?";

	db.query(
		updateQuery,
		["Done", time(), date(), taskId, clientId],
		(updateErr, updateResult) => {
			if (updateErr) {
				console.error("Error updating task status:", updateErr);
				return res.status(500).json({
					status: "error",
					message: "Error updating task status",
				});
			}

			if (updateResult.affectedRows === 0) {
				return res.status(404).json({
					status: "error",
					message:
						"Task not found for the given task id and client id",
				});
			}

			// You can include additional logic or messages here if needed

			return res.status(200).json({
				status: "success",
				message: "Task status has been updated to 'Done'",
			});
		}
	);
};
const postTaskCanceled = async (req, res) => {
	const taskId = req.body.taskId;
	const clientId = req.body.clientId;

	// Assuming you have a 'tasks' table
	const updateQuery =
		"UPDATE task SET status = ? WHERE task_id = ? AND client_id = ?";

	db.query(
		updateQuery,
		["Cancelled", taskId, clientId],
		(updateErr, updateResult) => {
			if (updateErr) {
				console.error("Error updating task status:", updateErr);
				return res.status(500).json({
					status: "error",
					message: "Error updating task status",
				});
			}

			if (updateResult.affectedRows === 0) {
				return res.status(404).json({
					status: "error",
					message:
						"Task not found for the given task id and client id",
				});
			}

			// You can include additional logic or messages here if needed

			return res.status(200).json({
				status: "success",
				message: "Task status has been updated to 'Canceled'",
			});
		}
	);
};
const getAttendance = async (req, res) => {
	const client_id = res.locals.id;
	const attendanceData = await queryParam(
		"SELECT attendance.attendance_id, attendance.client_id, attendance.time_in, attendance.time_out, attendance.date, COUNT(task.status) AS 'task_count' FROM attendance LEFT JOIN task ON task.client_id = attendance.client_id AND task.status = 'Done' AND attendance.date = task.date WHERE attendance.client_id = ? GROUP BY attendance.attendance_id, attendance.client_id, attendance.time_in, attendance.time_out, attendance.date;;",
		[client_id]
	);
	console.log(attendanceData);
	res.render("Client/attendance", {
		title: "Client Attendance",
		attendanceData,
	});
};
const getAnnouncement = async (req, res) => {
	const client_id = res.locals.id;
	const announcements = await queryParam(
		"SELECT * FROM announcement WHERE client_id = ? OR client_id IS NULL ORDER BY `announcement`.`announcement_id` DESC",
		[client_id]
	);

	res.render("Client/announcement", {
		title: "Client Announcement",
		announcements,
	});
};
const getProfile = async (req, res) => {
	const client_id = res.locals.id;
	const profileData = (
		await queryParam("SELECT * FROM `client` WHERE id = ?", [client_id])
	)[0];

	const membershipData = (
		await queryParam(
			"SELECT membership.*, COUNT(*) AS count, trainer.fullname AS trainer_name FROM membership JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE (membership_status = 'Waiting for Activation' OR membership_status = 'Activated') AND (payment_status = 'Pending' OR payment_status = 'Paid') AND (membership.trainer_id = trainer.trainer_id) AND client_id = ?",
			[client_id]
		)
	)[0];
	const membershipHistoryData = await queryParam(
		"SELECT membership.*, trainer.fullname AS trainer_name FROM membership JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE (membership_status = 'Cancelled' OR membership_status = 'Expired') AND (membership.trainer_id = trainer.trainer_id) AND client_id =  ? ORDER BY `membership`.`membership_id` DESC;",
		[client_id]
	);
	const trainers = await zeroParam("SELECT * FROM trainer");

	res.render("Client/profile", {
		title: "Client Profile",
		profileData,
		membershipData,
		membershipHistoryData,
		trainers,
	});
};
const postMembership = (req, res) => {
	let service_cost;
	const client_id = res.locals.id;

	const { membership_service, membership_plan, trainer_id } = req.body;
	const join_date = date_time(); // Assuming you want to set the join date as the current date
	const membership_status = "Waiting for Activation"; // Assuming new memberships start as active
	const payment_status = "Pending"; // Assuming new memberships start with payment already received

	if (membership_service === "Body Building") {
		service_cost = 300;
	} else if (membership_service === "Cardio") {
		service_cost = 450;
	} else if (membership_service === "Powerlifting") {
		service_cost = 500;
	}

	const data = {
		client_id,
		join_date,
		membership_service,
		membership_plan,
		membership_status,
		payment_status,
		trainer_id,
		total_amount: service_cost * membership_plan,
	};

	db.query("INSERT INTO membership SET ?", data, (err, result) => {
		if (err) {
			console.error("Error inserting membership:", err);
			req.flash("error", "Error creating membership");
			res.redirect("/profile");
		} else {
			req.flash("success_msg", "Membership created successfully");
			res.redirect("/profile");
		}
	});
};
const cancelMembership = (req, res) => {
	const membershipId = req.body.membershipId;
	const clientId = req.body.clientId;

	// Assuming you have a 'tasks' table
	const updateQuery =
		"UPDATE membership SET membership_status = ?, payment_status = ? WHERE membership_id = ? AND client_id = ?";

	db.query(
		updateQuery,
		["Cancelled", "Cancelled", membershipId, clientId],
		(updateErr, updateResult) => {
			if (updateErr) {
				console.error("Error updating membership status:", updateErr);
				return res.status(500).json({
					status: "error",
					message: "Error updating membership status",
				});
			}

			if (updateResult.affectedRows === 0) {
				return res.status(404).json({
					status: "error",
					message:
						"Membership not found for the given membership id and client id",
				});
			}

			// You can include additional logic or messages here if needed

			return res.status(200).json({
				status: "success",
				message: "Membership status has been updated to 'Cancelled'",
			});
		}
	);
};
const updateProfile = (req, res) => {
	const client_id = res.locals.id;
	const {
		fullName,
		age,
		gender,
		email,
		phonenumber,
		address,
		height,
		weight,
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
		"UPDATE client SET ? WHERE id = ?",
		[data, client_id],
		(err, result) => {
			if (err) {
				console.error("Error updating profile:", err);
				req.flash("error", "Error updating profile");
				res.redirect("/profile");
			} else {
				req.flash("success_msg", "Profile updated successfully");
				res.redirect("/profile");
			}
		}
	);
};
const getLogout = (req, res) => {
	res.clearCookie("token_client");
	res.redirect("/");
};
module.exports = {
	getLogin,
	postLogin,
	getRegister,
	postRegister,
	getDashboard,
	getTask,
	// postTask,
	postTaskDone,
	postTaskCanceled,
	getAttendance,
	getAnnouncement,
	getProfile,
	updateProfile,
	postMembership,
	cancelMembership,
	getLogout,
};
