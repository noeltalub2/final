const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin.controller");
const { requireAuth, forwardAuth } = require("../middleware/trainer.auth");

router.get("/signin", adminController.getLogin);
router.post("/signin", adminController.postLogin);

router.get("/dashboard", adminController.getDashboard);

router.get("/client", adminController.getClient);
// router.get("/client", requireAuth, adminController.getClient);
// router.get("/client/:username", requireAuth, adminController.getClientView);

// router.get("/task", requireAuth, adminController.getTask);
// router.get("/add_task", requireAuth, adminController.addTask);
// router.post("/add_task", requireAuth, adminController.postAddTask);

// router.get("/edit_task/:task_id", requireAuth, adminController.getEditTask);
// router.post("/edit_task/", requireAuth, adminController.postEditTask);

// router.post("/del_task/", requireAuth, adminController.deleteTask);

// router.get("/profile", requireAuth, requireAuth, adminController.getProfile);
// router.post(
// 	"/profile",
// 	requireAuth,
// 	requireAuth,
// 	adminController.updateProfile
// );

router.get("/logout", adminController.getLogout);

module.exports = router;
