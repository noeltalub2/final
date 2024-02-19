const express = require("express");
const router = express.Router();
const { imageUpload } = require("../middleware/imageUpload");
const trainerController = require("../controller/trainer.controller");
const { requireAuth, forwardAuth } = require("../middleware/trainer.auth");

router.get("/signin", forwardAuth, trainerController.getLogin);
router.post("/signin", forwardAuth, trainerController.postLogin);

router.get("/dashboard", requireAuth, trainerController.getDashboard);

router.get("/client", requireAuth, trainerController.getClient);
router.get("/client/:username", requireAuth, trainerController.getClientView);

router.get("/task", requireAuth, trainerController.getTask);
router.get("/add_task", requireAuth, trainerController.addTask);
router.post("/add_task", requireAuth, trainerController.postAddTask);

router.get("/edit_task/:task_id", requireAuth, trainerController.getEditTask);
router.post("/edit_task/", requireAuth, trainerController.postEditTask);

router.post("/del_task/", requireAuth, trainerController.deleteTask);

router.get("/announcement", requireAuth, trainerController.getAnnouncement);

router.get("/profile", requireAuth, trainerController.getProfile);
router.post(
	"/profile",
	requireAuth,
	imageUpload.single("avatar"),
	trainerController.updateProfile
);
router.get("/avatar", requireAuth, trainerController.getAvatar)
router.get("/logout", requireAuth, trainerController.getLogout);

module.exports = router;
