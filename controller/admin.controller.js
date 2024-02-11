const bcrypt = require("bcrypt");
const fs = require("fs");
const { createTokenClient, createTokenTrainer } = require("../utils/token");
const { date, date_time, expiration_date } = require("../utils/date");
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

const addEquipment = (req, res) => {
	res.render("Admin/add_equipment", {
		title: "Add Equipment",
	});
};

const postAddEquipment = (req, res) => {
	const {
		name,
		amount,
		quantity,
		description,
		vendorName,
		vendorAddress,
		vendorPhoneNumber,
	} = req.body;

	const data = {
		name,
		amount,
		quantity,
		description,
		vendor: vendorName,
		address: vendorAddress,
		phonenumber: vendorPhoneNumber,
		date: date(),
	};

	db.query("INSERT INTO equipment SET ?", data, (err, result) => {
		if (err) {
			console.log(err);
			req.flash("error", "Error inserting equipment");
			res.redirect("/admin/add_equipment");
		} else {
			req.flash("success_msg", "Successfully added equipment");
			res.redirect("/admin/add_equipment");
		}
	});
};

const editEquipment = async (req, res) => {
	const equipmentId = req.params.id;

	const equipment = (
		await queryParam("SELECT * FROM equipment WHERE id = ?", [equipmentId])
	)[0];

	res.render("Admin/edit_equipment", {
		title: "Add Equipment",
		equipment,
	});
};
const postEditEquipment = (req, res) => {
	const {
		id,
		name,
		amount,
		quantity,
		description,
		vendorName,
		vendorAddress,
		vendorPhoneNumber,
	} = req.body;

	const data = {
		name,
		amount,
		quantity,
		description,
		vendor: vendorName,
		address: vendorAddress,
		phonenumber: vendorPhoneNumber,
		// date: date(), // If you want to update the date as well, uncomment this line
	};

	db.query(
		"UPDATE equipment SET ? WHERE id = ?",
		[data, id],
		(err, result) => {
			if (err) {
				console.log(err);
				req.flash("error", "Error updating equipment");
				res.redirect(`/admin/edit_equipment/${id}`);
			} else {
				req.flash("success_msg", "Successfully updated equipment");
				res.redirect(`/admin/edit_equipment/${id}`);
			}
		}
	);
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

const getAttendance = async (req, res) => {
	const clients = await queryParam(
		"SELECT client.id, client.fullname, client.phonenumber, membership.membership_service, membership.membership_plan, attendance.time_in, attendance.time_out, attendance.date FROM membership INNER JOIN client ON client.id = membership.client_id LEFT JOIN attendance ON attendance.client_id = client.id AND attendance.date = ? WHERE membership.membership_status = 'Activated' AND membership.payment_status = 'Paid' ORDER BY client.id DESC",
		[date()]
	);
	res.render("Admin/attendance", {
		title: "Manage Attendance",
		clients,
	});
};

const postTimeIn = (req, res) => {
	const clientId = req.params.id;
	const currentTime = time();

	// Insert or update the record based on the unique key (client_id)
	db.query(
		"INSERT INTO attendance (client_id, time_in, date, status) VALUES (?, ?,?,?)",
		[clientId, currentTime, date(), 1],
		(err, result) => {
			if (err) {
				console.log(err);
				req.flash("error", "Error updating time in");
				res.redirect("/admin/attendance");
			} else {
				req.flash("success_msg", "Successfully checked in");
				res.redirect("/admin/attendance");
			}
		}
	);
};

const postTimeOut = (req, res) => {
	const clientId = req.params.id;
	const currentTime = time();

	// Update the existing record based on the unique key (client_id)
	db.query(
		"UPDATE attendance SET time_out = ?, status = ? WHERE client_id = ? AND date = ?",
		[currentTime, 2, clientId, date()],
		(err, result) => {
			if (err) {
				console.log(err);
				req.flash("error", "Error updating time out");
				res.redirect("/admin/attendance");
			} else {
				req.flash("success_msg", "Successfully checked out");
				res.redirect("/admin/attendance");
			}
		}
	);
};

const getHistoryAttendance = async (req, res) => {
	const attendanceData = await zeroParam(
		"SELECT attendance.*, client.fullname FROM attendance INNER JOIN client ON attendance.client_id = client.id ORDER BY `attendance`.`attendance_id` DESC"
	);
	res.render("Admin/attendance_history", {
		title: "History Attendance",
		attendanceData,
	});
};

const getMembership = async (req, res) => {
	const membership = await zeroParam(
		"SELECT membership.*, client.fullname AS client_fullname, client.phonenumber, trainer.fullname AS trainer_fullname FROM membership INNER JOIN client ON membership.client_id = client.id INNER JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE membership.membership_status IN ('Activated', 'Expired') AND membership.payment_status = 'Paid' ORDER BY membership.status_change_date DESC;"
	);

	res.render("Admin/membership", { title: "Manage Membership", membership });
};

const getUpcomingMembership = async (req, res) => {
	const membership = await zeroParam(
		"SELECT membership.*, client.fullname AS client_name, client.id AS client_id, client.phonenumber, trainer.fullname AS trainer_name FROM membership INNER JOIN client ON membership.client_id = client.id LEFT JOIN trainer ON membership.trainer_id = trainer.trainer_id WHERE membership.membership_status = 'Waiting for Activation' AND membership.payment_status = 'Pending' ORDER BY membership.membership_id DESC;"
	);

	res.render("Admin/upcoming_membership", {
		title: "Upcoming Membership",
		membership,
	});
};

const getPaymentMembership = async (req, res) => {
	const membership_id = req.params.id;
	const membership = (
		await queryParam(
			"SELECT membership.*, client.fullname, client.phonenumber FROM membership INNER JOIN client ON membership.client_id = client.id WHERE membership.membership_id = ?",
			[membership_id]
		)
	)[0];

	res.render("Admin/payment_membership", {
		title: "Payment Membership",
		membership,
	});
};

const confirmPayment = (req, res) => {
	const membership_id = req.body.id;
	const membership_plan = req.body.plan;

	const data = {
		membership_status: "Activated",
		payment_status: "Paid",
		status_change_date: date_time(),
		date_expiration: expiration_date(+membership_plan),
	};

	db.query(
		"UPDATE membership SET ? WHERE membership_id = ?",
		[data, membership_id],
		(err, result) => {
			if (err) {
				console.error("Error updating membership:", err);
				res.status(500).json({
					status: "error",
					message:
						"Failed to update membership. Please try again later.",
				});
			} else {
				res.status(200).json({
					status: "success",
					message: "Payment confirmation completed.",
				});
			}
		}
	);
};

const alertPayment = (req, res) => {
	const id = req.body.id;
	const plan = req.body.plan;

	const announcement = {
		client_id: id,
		title: "Payment Alert",
		message: `Please be informed that your payment for the ${plan} membership is due. Kindly settle the payment as soon as possible to avoid any inconvenience. Thank you.`,
		date: date_time(), // Get the current date in YYYY-MM-DD format
	};

	db.query("INSERT INTO announcement SET ?", announcement, (err, result) => {
		if (err) {
			console.error("Error inserting announcement:", err);
			return res.status(500).json({
				status: "error",
				message: "Failed to send payment alert",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Payment alert sent successfully",
		});
	});
};
const cancelMembership = (req, res) => {
	const id = req.body.id;
	const data = {
		membership_status: "Cancelled",
		payment_status: "Cancelled",
	};

	db.query(
		"UPDATE membership SET ? WHERE membership_id = ?",
		[data, id],
		(err, result) => {
			if (err) {
				console.error("Error cancelling membership:", err);
				res.status(500).json({
					status: "error",
					message: "Error cancelling membership",
				});
			} else {
				res.status(200).json({
					status: "success",
					message: "Membership successfully cancelled",
				});
			}
		}
	);
};

const getAnnouncement = async (req, res) => {
	const announcement = await zeroParam(
		"SELECT * FROM announcement ORDER BY announcement_id DESC"
	);

	res.render("Admin/announcement", {
		title: "Announcement",
		announcement,
	});
};

const postAnnouncement = (req, res) => {
	const { title, message } = req.body;

	const data = {
		title,
		message,
		date: date_time(),
	};

	db.query("INSERT INTO announcement SET ?", data, (err, result) => {
		if (err) {
			console.log(err);
			req.flash("error", "Error inserting announcement");
			res.redirect("/admin/announcement");
		} else {
			req.flash("success_msg", "Successfully added announcement");
			res.redirect("/admin/announcement");
		}
	});
};

const editAnnouncement = (req, res) => {
	const { announcementId, title, message } = req.body;

	const data = {
		title,
		message,
	};

	db.query(
		"UPDATE announcement SET ? WHERE announcement_id = ?",
		[data, announcementId],
		(err, result) => {
			if (err) {
				console.log(err);
				req.flash("error", "Error updating announcement");
				res.redirect("/admin/announcement");
			} else {
				req.flash("success_msg", "Announcement updated successfully");
				res.redirect("/admin/announcement");
			}
		}
	);
};

const deleteAnnouncement = (req, res) => {
	const announcementId = req.body.id;

	db.query(
		"DELETE FROM announcement WHERE announcement_id = ?",
		announcementId,
		(err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					status: "error",
					message: "Error deleting announcement",
				});
			}

			if (result.affectedRows === 0) {
				return res.status(404).json({
					status: "error",
					message: "Announcement not found",
				});
			}

			return res.status(200).json({
				status: "success",
				message: "Announcement deleted successfully",
			});
		}
	);
};

const getTrainer = async (req, res) => {
	const trainerData = await zeroParam(
		"SELECT * FROM trainer ORDER BY trainer_id DESC"
	);

	res.render("Admin/trainer", { title: "Manage Trainer", trainerData });
};

const addTrainer = (req, res) => {
	res.render("Admin/add_trainer", { title: "Add Trainer" });
};

const postTrainer = async (req, res) => {
	//Data from the form ../register
	const {
		fullname,
		confirmPassword,
		email,
		phonenumber,
		username,
		age,
		address,
		gender,
	} = req.body;
	let errors = [];
	//Sql statement if there is duplciate in database
	var username_exist =
		"Select count(*) as `count` from trainer where username = ?";
	var email_exist = "Select count(*) as `count` from trainer where email = ?";
	var phone_exist =
		"Select count(*) as `count` from trainer where phonenumber = ?";
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
		age,
		address,
		password: hash,
		join_date: date_time(),
	};
	//Add account to database
	var sql = "INSERT INTO trainer SET ?";
	db.query(sql, data, (err, rset) => {
		if (err) {
			console.log(err);
			res.render("Adnin/add_trainer", {
				errors,
			});
		} else {
			req.flash("success_msg", "Account created successfully");
			res.redirect("/admin/trainer/add");
		}
	});
};

const getEditTrainer = async (req, res) => {
	const id = req.params.id;
	const trainer = (
		await queryParam("SELECT * FROM trainer WHERE trainer_id = ?", [id])
	)[0];

	res.render("Admin/edit_trainer", { title: "Edit Trainer", trainer });
};

const editPostTrainer = async (req, res) => {
    // Data from the form ../register
    const {
		id,
        fullname,
        email,
        phonenumber,
        username,
        age,
        address,
        gender
    } = req.body;
    let errors = [];
    console.log(req.params.id)
    // Sql statement if there is duplicate in database
    const usernameExistQuery = "SELECT COUNT(*) AS count FROM trainer WHERE username = ?";
    const emailExistQuery = "SELECT COUNT(*) AS count FROM trainer WHERE email = ?";
    const phoneExistQuery = "SELECT COUNT(*) AS count FROM trainer WHERE phonenumber = ?";
    
    // Query for checking duplicate entries
    const usernameCount = (await queryParam(usernameExistQuery, [username]))[0].count;
    const emailCount = (await queryParam(emailExistQuery, [email]))[0].count;
    const phoneCount = (await queryParam(phoneExistQuery, [phonenumber]))[0].count;

    // Check if there are duplicates
    if (emailCount > 0) {
        errors.push({ msg: "Email is already registered" });
    }
    if (phoneCount > 0) {
        errors.push({ msg: "Phonenumber is already registered" });
    }
    if (usernameCount > 0) {
        errors.push({ msg: "Username is already registered" });
    }

    // Data to update in the database
    const data = {
        fullname,
        email,
        username,
        phonenumber,
        age,
        address,
        gender
    };
    
    // SQL statement to update trainer information
    const sql = "UPDATE trainer SET ? WHERE trainer_id = ?";

    // Update the trainer information
    db.query(sql, [data, id], (err, result) => {
        if (err) {
			req.flash("error_msg", "The provided Username, Phone Number, or Email is already registered.");
			res.redirect("/admin/trainer/edit/" + id);
			
        } else {
            req.flash("success_msg", "Trainer information updated successfully");
            res.redirect("/admin/trainer/edit/" + id);
        }
    });
};

const deleteTrainer = async (req, res) => {
	const username = req.body.userId;
	const id = (
		await queryParam("SELECT trainer_id FROM trainer WHERE username = ?", [username])
	)[0].trainer_id;
	try {
		
		const task = (
			await queryParam("DELETE FROM task WHERE trainer_id = ?", [id])
		)[0];
		const membership = (
			await queryParam("DELETE FROM membership WHERE trainer_id = ?", [id])
		)[0];

		const profile = (
			await queryParam("DELETE FROM trainer WHERE trainer_id = ?", [id])
		)[0];
	
		res.status(200).json({
			status: "success",
			message: "Trainer Deleted Successfully",
		});
	} catch (err) {
		console.log(err)
		res.status(200).json({
			status: "error",
			message: "There was an error deleting the trainer",
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
	addEquipment,
	postAddEquipment,
	editEquipment,
	postEditEquipment,
	deleteEquipment,
	getAttendance,
	postTimeIn,
	postTimeOut,
	getHistoryAttendance,
	getMembership,
	getUpcomingMembership,
	getPaymentMembership,
	confirmPayment,
	alertPayment,
	cancelMembership,
	getAnnouncement,
	postAnnouncement,
	editAnnouncement,
	deleteAnnouncement,
	getTrainer,
	addTrainer,
	postTrainer,
	getEditTrainer,
	editPostTrainer,
	deleteTrainer,
	getLogout,
};
