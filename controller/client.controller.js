const bcrypt = require("bcrypt");
const fs = require("fs");
const { createTokenClient } = require("../utils/token");
const { date, date_time } = require("../utils/date");
const { time, convertDate } = require("../utils/timestamp");
const puppeteer = require("puppeteer");

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
		errors.push({ msg: "Username is already registered" });
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
		profile_picture: "avatar.png",
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
		profile_picture,
	} = req.body;

	const avatar = req.file ? req.file.filename : null; // set avatar to null if req.file is empty

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
		(err, rset) => {
			if (err) {
				console.log(err);
				req.flash(
					"error_msg",
					"Failed to update your profile phone number or email was already registered"
				);
				return res.redirect(`/profile`);
			} else {
				if (avatar) {
					if (profile_picture !== "avatar.png") {
						const avatarPath = `public/img/avatar/${profile_picture}`;
						if (fs.existsSync(avatarPath)) {
							fs.unlink(avatarPath, (err) => {
								if (err) {
									console.log(err);
								}
							});
						}
					}
					db.query(
						"UPDATE client SET profile_picture = ? WHERE id = ?",
						[avatar, client_id],
						(err, rset) => {
							if (err) {
								console.log(err);
								req.flash(
									"error_msg",
									"Failed to update your profile"
								);
								return res.redirect(`/profile`);
							} else {
								req.flash(
									"success_msg",
									"Successfully updated your profile"
								);
								return res.redirect(`/profile`);
							}
						}
					);
				} else {
					req.flash(
						"success_msg",
						"Successfully updated your profile"
					);
					return res.redirect(`/profile`);
				}
			}
		}
	);
};

const getAvatar = async (req, res) => {
	const id = res.locals.id;

	const avatar = (
		await queryParam(
			"SELECT fullname, profile_picture FROM client WHERE id = ?",
			[id]
		)
	)[0];

	res.status(200).json({ avatar });
};

const generatePdf = async (req, res) => {
	const id = req.params.id
	
	const membership = (await queryParam(
		"SELECT membership.*, client.fullname AS client_fullname, trainer.fullname AS trainer_fullname FROM membership INNER JOIN client ON membership.client_id = client.id INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE membership.membership_id = ?",[id]
	))[0];

	const browser = await puppeteer.launch();

	// Create a new page
	const page = await browser.newPage();

	// Set the HTML content for the PDF
	const htmlContent = `
	<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership Reciept</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }

    .receipt {
      max-width: 680px;
      margin: 20px auto;
      padding: 20px;
     
      border-radius: 8px;
    }

    .logo {
      text-align: center;
    }

    .logo img {
      max-width: 100%;
      height: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .details {
      margin-bottom: 20px;
    }

    .details p {
      margin: 5px 0;
    }

    .items {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }

    .items th, .items td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    .total {
      text-align: right;
    }

	.footer {
		margin-top: 80px;
		text-align: center;
	}
  </style>
  <title>Gym Membership Receipt</title>
</head>
<body>

<div class="receipt">
  <div class="logo">
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"  width="100.000000pt" height="100.000000pt" viewBox="0 0 300.000000 300.000000"  preserveAspectRatio="xMidYMid meet">  <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M1410 2734 c-225 -21 -418 -88 -605 -212 -223 -148 -398 -378 -484 -637 -86 -260 -80 -561 16 -820 200 -541 772 -877 1346 -790 626 94 1079 640 1054 1270 -7 202 -52 365 -147 543 -153 283 -417 497 -735 596 -116 35 -333 60 -445 50z m321 -49 c400 -84 719 -339 880 -704 64 -145 90 -261 96 -436 8 -229 -29 -403 -128 -595 -331 -646 -1149 -858 -1753 -456 -257 171 -434 428 -512 746 -15 60 -19 112 -18 265 0 174 2 199 27 289 95 354 329 638 653 792 116 55 259 98 379 114 93 12 284 4 376 -15z"/> <path d="M1285 2664 c-281 -51 -553 -218 -724 -444 -355 -472 -323 -1105 79 -1533 172 -184 412 -314 660 -358 92 -16 312 -16 400 0 117 21 285 81 377 133 563 323 769 1001 478 1578 -106 210 -307 410 -523 519 -87 44 -221 87 -326 106 -109 19 -313 18 -421 -1z m366 -19 c128 -12 307 -72 434 -147 389 -229 613 -668 567 -1112 -69 -663 -669 -1130 -1325 -1031 -407 61 -753 338 -905 725 -111 283 -100 624 29 907 99 217 302 427 524 543 122 63 309 114 450 123 51 3 142 0 226 -8z"/> <path d="M1595 2581 l-100 -6 36 -23 c31 -19 38 -29 41 -62 2 -22 1 -40 -2 -40 -3 0 -32 27 -65 60 l-59 60 -96 0 -95 0 43 -26 42 -25 0 -69 c0 -69 -1 -70 -35 -92 -35 -23 -48 -45 -19 -34 9 3 54 6 101 6 l86 0 -41 30 c-37 27 -42 35 -42 70 0 22 2 40 4 40 2 0 32 -29 67 -65 61 -64 63 -65 116 -65 l54 0 -2 92 -2 92 39 33 c21 18 37 32 34 31 -3 -1 -50 -4 -105 -7z m-113 -106 c39 -36 68 -55 84 -55 19 0 25 -5 22 -17 -7 -35 -38 -25 -99 31 -33 31 -71 59 -84 62 -14 3 -25 12 -25 20 0 30 45 12 102 -41z"/> <path d="M952 2425 l-103 -63 45 -6 c43 -7 48 -11 79 -64 l34 -57 -18 -37 c-25 -50 -24 -53 11 -28 16 12 65 41 107 65 l78 45 -46 0 c-46 0 -47 0 -83 61 l-37 62 17 36 c9 20 19 39 21 44 6 10 7 11 -105 -58z m70 -102 c42 -73 42 -73 29 -73 -6 0 -20 19 -32 42 -12 23 -28 48 -35 56 -16 15 -18 32 -5 32 5 0 24 -26 43 -57z"/> <path d="M1920 2444 c-37 -15 -70 -58 -70 -92 0 -76 59 -145 165 -193 36 -16 65 -37 71 -50 10 -22 11 -21 33 14 21 34 26 37 69 37 l47 0 -65 41 c-36 23 -81 54 -101 70 -20 16 -40 29 -43 29 -4 0 3 -18 14 -41 12 -23 19 -47 16 -54 -6 -18 -45 -8 -80 20 -41 33 -41 83 -1 125 64 66 162 11 195 -110 6 -24 7 -24 33 17 32 50 32 52 10 47 -12 -2 -28 11 -48 39 -18 24 -53 54 -82 70 -51 27 -133 43 -163 31z m30 -50 c0 -16 -43 -74 -51 -68 -14 8 -11 36 8 56 15 17 43 25 43 12z"/> <path d="M1405 2303 c-241 -30 -456 -165 -589 -370 -88 -137 -126 -265 -126 -434 -1 -456 352 -809 810 -809 358 0 652 212 774 558 29 82 30 95 31 242 0 173 -14 239 -81 374 -149 297 -490 480 -819 439z m253 -39 c291 -60 528 -285 603 -575 27 -103 29 -282 4 -373 -45 -167 -143 -325 -265 -423 -340 -275 -840 -225 -1110 110 -62 76 -132 218 -155 312 -26 105 -24 278 5 380 113 406 511 653 918 569z"/> <path d="M1340 2244 c-175 -38 -349 -150 -454 -293 -140 -190 -184 -447 -115 -676 134 -446 651 -670 1065 -462 239 121 391 337 423 604 19 149 -19 331 -96 463 -76 129 -233 265 -378 327 -119 50 -311 66 -445 37z m407 -51 c213 -80 380 -249 449 -454 66 -195 54 -378 -35 -564 -116 -239 -350 -395 -620 -411 -210 -13 -404 61 -556 211 -255 252 -292 653 -86 947 33 48 140 154 188 187 57 39 153 82 226 102 59 15 97 18 212 16 127 -3 147 -6 222 -34z"/> <path d="M1311 2123 c0 -4 10 -53 22 -108 17 -76 27 -101 40 -103 12 -2 17 3 17 17 0 21 0 21 20 1 11 -11 32 -20 48 -19 l27 0 -25 17 c-13 9 -33 25 -43 35 -17 17 -18 20 -2 37 9 10 27 21 41 24 21 6 24 12 25 54 1 42 2 44 9 17 4 -16 8 -65 9 -107 1 -63 4 -78 16 -78 12 0 14 7 9 26 -6 24 -5 25 13 16 11 -6 25 -18 33 -26 7 -9 20 -16 29 -16 13 0 23 24 43 108 14 59 24 109 22 111 -2 3 -14 -5 -27 -17 -13 -12 -29 -22 -35 -22 -8 0 -12 -19 -12 -52 0 -72 -13 -91 -34 -50 -9 17 -16 43 -16 57 0 15 -12 39 -26 55 l-27 28 -58 -62 c-48 -51 -59 -58 -64 -43 -5 11 -1 25 9 36 20 22 20 31 2 31 -7 0 -25 9 -40 21 -14 11 -26 17 -25 12z"/> <path d="M1360 1815 c0 -43 4 -75 10 -75 6 0 10 -9 10 -20 0 -11 5 -20 10 -20 14 0 13 33 -2 48 -9 9 -8 16 4 29 8 10 13 24 11 31 -6 15 14 15 56 1 24 -9 43 -8 77 1 56 16 67 7 66 -55 0 -25 4 -43 9 -39 5 3 9 -5 9 -18 0 -25 -89 -120 -123 -132 -22 -7 -57 9 -57 27 0 7 -18 32 -40 56 -22 25 -40 54 -40 65 0 14 -3 17 -11 9 -8 -8 -8 -21 2 -46 10 -28 10 -44 0 -76 -10 -35 -16 -41 -40 -41 -40 0 -91 -20 -91 -35 0 -7 -6 -15 -12 -18 -7 -2 -10 -8 -6 -12 3 -3 19 2 35 14 65 47 190 45 240 -5 50 -50 14 -85 -105 -101 -36 -5 -53 0 -120 35 -88 45 -201 69 -189 39 4 -11 -1 -20 -13 -27 -44 -24 -41 5 6 51 33 31 40 34 95 33 37 -1 55 2 47 7 -7 5 -38 8 -68 8 -48 0 -64 -6 -130 -48 -72 -46 -75 -50 -88 -102 -19 -81 -19 -208 0 -244 31 -58 51 -68 130 -66 40 1 88 4 106 7 29 6 32 4 32 -18 0 -14 16 -60 35 -102 l36 -76 213 0 214 0 30 53 c16 29 37 75 47 102 l18 50 154 0 c125 0 156 3 164 15 7 9 8 59 5 135 -5 104 -10 127 -33 173 -15 30 -38 62 -51 72 -38 30 -124 45 -181 32 -41 -9 -53 -8 -87 8 -21 10 -55 21 -74 23 -47 4 -68 43 -47 84 16 31 12 193 -5 226 -8 15 -25 17 -133 17 l-125 0 0 -75z m80 -250 c24 -15 7 -21 -30 -11 -39 10 -40 12 -34 41 10 48 16 50 35 12 11 -20 23 -39 29 -42z m167 12 c-5 -15 -55 -32 -64 -23 -3 3 5 18 18 34 20 25 26 28 38 17 7 -8 11 -20 8 -28z m155 -69 c34 -19 38 -20 53 -4 38 38 168 10 177 -38 5 -27 -9 -35 -29 -15 -7 7 -13 7 -17 1 -3 -5 8 -15 24 -22 77 -32 130 -140 78 -159 l-22 -8 22 -12 c24 -13 30 -57 12 -90 -8 -17 -13 -16 -82 6 -83 28 -178 41 -178 26 0 -6 17 -13 38 -15 49 -7 121 -39 103 -45 -28 -11 -156 20 -221 53 -36 18 -101 42 -144 53 -44 12 -81 23 -84 25 -10 10 53 56 96 70 26 8 116 20 201 25 134 9 159 8 188 -6 18 -8 33 -19 33 -24 0 -5 8 -9 17 -9 14 0 12 5 -10 28 -26 26 -32 27 -127 27 -55 0 -100 3 -100 7 0 4 12 18 27 32 15 14 24 29 20 32 -4 4 -22 -7 -41 -25 l-33 -32 -79 27 c-58 19 -90 25 -121 20 -38 -5 -43 -3 -43 14 0 33 42 70 90 79 57 12 105 5 152 -21z m-588 -56 c3 -5 -22 -16 -54 -26 -33 -9 -60 -22 -60 -29 0 -6 -16 -26 -37 -43 -22 -19 -33 -35 -29 -43 5 -8 19 -1 47 24 40 36 63 43 75 24 4 -7 20 -9 43 -5 20 4 77 11 126 16 50 5 119 19 155 30 79 24 148 25 221 4 81 -24 83 -34 6 -34 -60 0 -76 -5 -145 -42 -42 -22 -103 -61 -135 -84 -32 -24 -86 -57 -120 -73 -62 -31 -168 -63 -177 -54 -12 11 55 53 110 69 66 18 82 39 23 28 -55 -9 -118 -38 -175 -81 -57 -41 -69 -39 -100 17 -25 47 -25 171 0 220 20 41 58 63 83 49 11 -6 19 -5 21 2 2 6 26 17 53 24 62 17 63 17 69 7z m45 -21 c11 -7 3 -12 -30 -21 -24 -6 -59 -15 -77 -20 -56 -15 -32 11 28 30 68 22 62 21 79 11z m76 -42 c7 -8 2 -10 -19 -6 -16 2 -43 1 -60 -3 -69 -18 -86 -20 -86 -12 0 5 21 16 48 25 49 16 99 15 117 -4z m253 -170 c81 -24 109 -46 46 -35 -21 4 -48 10 -59 13 -35 11 1 -23 51 -46 24 -12 44 -23 44 -26 0 -3 -7 -17 -16 -30 -13 -20 -25 -25 -61 -25 -27 0 -42 -4 -38 -10 3 -5 26 -10 51 -10 24 0 44 -3 44 -6 0 -14 -44 -80 -64 -96 -12 -10 -31 -18 -44 -18 -21 0 -22 3 -16 55 5 38 3 55 -5 55 -11 0 -14 -19 -11 -82 2 -38 -9 -47 -33 -28 -7 5 -27 21 -44 36 -24 18 -33 34 -33 55 0 27 2 29 42 29 51 0 45 8 -13 18 -43 7 -44 8 -44 47 0 38 1 39 40 47 22 4 50 10 63 13 20 5 22 2 22 -35 0 -22 5 -40 10 -40 6 0 10 26 10 59 l0 59 -65 -24 c-91 -33 -97 -30 -34 15 30 22 61 38 69 36 8 -2 48 -13 88 -26z m132 -71 c0 -2 -16 -45 -34 -96 -34 -94 -58 -132 -83 -132 -19 0 -17 5 16 38 17 17 33 45 37 68 9 49 42 124 54 124 6 0 10 -1 10 -2z m64 -45 c-2 -44 -80 -173 -104 -173 -24 0 -24 4 -6 33 8 12 24 51 35 86 24 73 38 93 60 89 11 -3 16 -14 15 -35z m-433 -10 c7 -21 12 -51 11 -67 -2 -22 7 -38 38 -67 38 -37 39 -39 17 -39 -14 0 -29 6 -35 13 -10 12 -82 180 -82 191 0 3 9 6 19 6 14 0 23 -12 32 -37z m-53 -45 c11 -29 27 -70 36 -90 14 -32 14 -38 2 -38 -21 0 -107 152 -94 168 20 23 35 12 56 -40z"/> <path d="M2310 2231 c0 -7 -13 -32 -28 -55 -15 -22 -31 -47 -36 -54 -4 -7 17 -3 56 11 35 13 69 26 76 28 8 3 -2 19 -28 44 -22 21 -40 33 -40 26z"/> <path d="M620 2133 c-57 -110 -56 -107 -36 -100 9 4 22 9 30 12 10 5 15 -10 19 -61 4 -37 5 -69 3 -72 -2 -2 -17 3 -32 11 -19 10 -32 28 -39 53 l-11 39 -38 -75 c-21 -41 -45 -84 -52 -95 -23 -32 -16 -36 25 -16 l38 20 61 -32 c61 -32 62 -33 62 -74 0 -51 13 -55 31 -10 7 17 28 58 47 90 19 32 31 61 28 64 -3 3 -18 1 -35 -5 -16 -6 -32 -8 -35 -5 -3 4 -6 28 -6 55 l0 48 40 0 c37 0 39 -2 46 -36 l6 -35 54 93 c29 51 54 96 54 100 0 3 -17 -2 -38 -12 -21 -10 -66 -22 -99 -25 l-61 -7 -6 43 c-3 24 -7 61 -8 82 -3 37 -3 37 -48 -50z m1 -253 c30 0 64 -33 56 -54 -5 -13 -16 -9 -59 19 -29 19 -56 35 -60 35 -5 0 -8 7 -8 16 0 14 2 14 22 0 12 -9 34 -16 49 -16z"/> <path d="M2363 2028 c-38 -18 -45 -68 -21 -156 32 -122 32 -122 14 -122 -36 0 -75 133 -57 196 6 21 8 40 6 42 -2 3 -25 -4 -50 -15 -45 -19 -45 -20 -25 -38 11 -10 20 -26 20 -35 0 -47 44 -156 75 -187 39 -39 64 -41 102 -9 24 21 28 31 26 73 -1 26 -11 75 -23 107 -24 70 -25 96 -5 96 29 0 50 -60 50 -146 0 -74 2 -81 17 -73 9 5 29 14 44 19 l27 11 -22 22 c-11 13 -21 34 -21 48 0 44 -34 121 -68 150 -35 31 -53 34 -89 17z"/> <path d="M2119 914 c-46 -36 -85 -67 -87 -69 -1 -1 7 -26 18 -55 11 -29 19 -55 16 -57 -2 -2 -23 9 -47 26 -23 17 -46 31 -51 31 -5 0 -28 -15 -51 -34 -23 -18 -60 -45 -81 -60 l-39 -26 50 0 c49 0 52 -1 92 -54 l41 -55 -16 -36 c-8 -21 -13 -39 -11 -41 2 -2 36 22 76 54 l73 57 -46 3 c-25 2 -46 6 -46 10 0 4 -20 30 -44 57 -25 28 -41 51 -37 53 5 1 46 -22 92 -53 90 -59 95 -61 121 -42 15 12 14 22 -21 120 -21 59 -35 107 -31 107 4 0 28 -27 53 -61 42 -57 44 -64 35 -96 -5 -19 -8 -37 -5 -39 2 -2 42 27 90 64 l86 67 -43 3 c-40 3 -48 8 -84 56 -39 51 -40 53 -26 91 7 22 12 41 10 42 -1 2 -41 -27 -87 -63z m60 -77 c11 -18 29 -42 41 -52 24 -21 26 -35 5 -35 -8 0 -15 4 -15 9 0 6 -18 31 -40 56 -44 51 -46 55 -26 55 8 0 24 -15 35 -33z"/> <path d="M790 857 c-14 -7 -33 -28 -43 -48 -14 -30 -15 -42 -6 -70 25 -73 106 -149 180 -169 27 -8 40 -18 46 -37 l9 -27 24 38 c22 37 25 38 67 33 51 -5 54 2 11 27 -18 11 -61 41 -95 68 -35 26 -65 48 -67 48 -3 0 3 -20 14 -44 10 -24 16 -47 13 -50 -27 -26 -113 32 -113 76 0 35 34 84 67 96 58 20 131 -39 155 -124 l10 -38 19 25 c37 46 42 59 21 59 -10 0 -32 19 -49 44 -56 80 -193 128 -263 93z m60 -32 c0 -13 -58 -84 -64 -78 -12 13 -6 43 14 63 18 18 50 28 50 15z"/> <path d="M1290 648 c0 -4 12 -14 28 -22 33 -17 132 -129 132 -149 0 -8 -18 -26 -40 -41 -22 -14 -40 -27 -40 -29 0 -1 56 -2 125 -2 69 0 125 1 125 2 0 2 -18 15 -40 29 -22 15 -40 33 -40 41 0 20 87 120 130 149 l35 24 -90 0 c-84 0 -88 -1 -67 -16 28 -19 28 -26 -2 -61 l-24 -28 -26 24 c-32 30 -32 38 -3 61 22 18 20 19 -91 22 -61 2 -112 0 -112 -4z m215 -146 c-3 -8 -5 -23 -6 -35 0 -13 -6 -3 -15 23 -7 25 -14 46 -14 48 0 1 9 -3 20 -10 11 -7 18 -19 15 -26z"/> </g> </svg> 

  </div>
  <div class="header">
    <h2>King's Gym Membership</h2>
  </div>
  <div class="details">
    
    <p>Receipt #: ${membership.membership_id}</p>
    <p>Client Name: ${membership.client_fullname}</p>
   
	<p>Start Date: ${new Date(membership.status_change_date).toLocaleDateString('en-US', { month: 'long'
	, day: 'numeric' , year: 'numeric' })}</p>
    <p>Expiration Date: ${new Date(membership.date_expiration).toLocaleDateString('en-US', { month: 'long'
	, day: 'numeric' , year: 'numeric' })}</p>
	<p>Payment Status: <strong>PAID</strong> </p>
  </div>
  <table class="items">
    <thead>
      <tr>
	  	<th>Trainer Name</th>
        <th>Service</th>
		<th>Plan</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
	  <td>${membership.trainer_fullname}</td>
        <td>${membership.membership_service}</td>
		<td>${membership.membership_plan} month/s</td>
        <td>PHP ${membership.total_amount}</td>
      </tr>
    </tbody>
  </table>
  <div class="total">
    <p>Total: PHP ${membership.total_amount}</p>
  </div>
  <div class="footer">
    <p>Thank you for choosing our King's Gym!</p>
  </div>
</div>

</body>
</html>

	`;

	// Set the HTML content and wait for a brief moment to allow the image to load
	await page.setContent(htmlContent);

	// Generate the PDF
	const pdfBuffer = await page.pdf({
		title: 'Membership Receipt',
	  });

	// Close the browser
	await browser.close();

	// Set headers for automatic download
	res.setHeader("Content-Type", "application/pdf");
	res.setHeader('Content-Disposition', 'attachment; filename=membership-receipt.pdf');

	// Send the PDF as a response
	res.send(pdfBuffer);
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
	postTaskDone,
	postTaskCanceled,
	getAttendance,
	getAnnouncement,
	getProfile,
	updateProfile,
	postMembership,
	cancelMembership,
	getAvatar,
	generatePdf,
	getLogout,
};
