const express = require("express");
const router = express.Router();
const { imageUpload } = require("../middleware/imageUpload");
const clientController = require("../controller/client.controller");
const { requireAuth, forwardAuth } = require("../middleware/client.auth");

router.get("/", forwardAuth, clientController.getLogin);
router.post("/", forwardAuth, clientController.postLogin);

router.get("/signup", forwardAuth, clientController.getRegister);
router.post("/signup", forwardAuth, clientController.postRegister);

router.get("/dashboard", requireAuth, clientController.getDashboard);

router.get("/task", requireAuth, clientController.getTask);
// router.post("/task", requireAuth, clientController.postTask);
router.post("/done_task", requireAuth, clientController.postTaskDone);
router.post("/cancel_task", requireAuth, clientController.postTaskCanceled);

router.get("/attendance", requireAuth, clientController.getAttendance);

router.get("/announcement", requireAuth, clientController.getAnnouncement);

router.get("/profile", requireAuth, clientController.getProfile);
router.post(
	"/profile",
	requireAuth,
	imageUpload.single("avatar"),
	clientController.updateProfile
);
router.post("/membership", requireAuth, clientController.postMembership);
router.post(
	"/cancel_membership",
	requireAuth,
	clientController.cancelMembership
);

router.get("/avatar", requireAuth, clientController.getAvatar)
router.get("/generatePdf/:id", requireAuth, clientController.generatePdf)

router.get("/logout", requireAuth, clientController.getLogout);

module.exports = router;
