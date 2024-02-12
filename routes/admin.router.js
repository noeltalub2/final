const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin.controller");
const { requireAuth, forwardAuth } = require("../middleware/admin.auth");

router.get("/signin", forwardAuth, adminController.getLogin);
router.post("/signin", forwardAuth, adminController.postLogin);

router.get("/dashboard", requireAuth, adminController.getDashboard);

router.get("/client", requireAuth, adminController.getClient);
// router.get("/client", requireAuth, adminController.getClient);
router.get("/client/:username", requireAuth, adminController.getClientView);
router.post("/client", requireAuth, adminController.updateProfile);
router.post("/del_client", requireAuth, adminController.deleteClient);

router.get("/equipment", requireAuth, adminController.getEquipment);
router.get("/add_equipment", requireAuth, adminController.addEquipment);
router.post("/add_equipment", requireAuth, adminController.postAddEquipment);

router.get("/edit_equipment/:id", requireAuth, adminController.editEquipment);
router.post("/edit_equipment/", requireAuth, adminController.postEditEquipment);

router.post("/del_equipment", requireAuth, adminController.deleteEquipment);

router.get("/attendance", requireAuth, adminController.getAttendance);
router.get("/time-in/:id", requireAuth, adminController.postTimeIn);
router.get("/time-out/:id", requireAuth, adminController.postTimeOut);

router.get(
	"/attendance/history",
	requireAuth,
	adminController.getHistoryAttendance
);

router.get("/membership", requireAuth, adminController.getMembership);

router.get(
	"/membership/upcoming",
	requireAuth,
	adminController.getUpcomingMembership
);
router.get(
	"/membership/upcoming/:id",
	requireAuth,
	adminController.getPaymentMembership
);
router.post("/confirm_payment", requireAuth, adminController.confirmPayment);
router.post("/alert_payment", requireAuth, adminController.alertPayment);
router.post(
	"/cancel_membership",
	requireAuth,
	adminController.cancelMembership
);

router.get("/announcement", requireAuth, adminController.getAnnouncement);
router.post("/announcement", requireAuth, adminController.postAnnouncement);
router.post(
	"/announcement/edit",
	requireAuth,
	adminController.editAnnouncement
);
router.post(
	"/announcement/delete",
	requireAuth,
	adminController.deleteAnnouncement
);

router.get("/trainer", requireAuth, adminController.getTrainer);
router.get("/trainer/add", requireAuth, adminController.addTrainer);
router.post("/trainer/add", requireAuth, adminController.postTrainer);
router.get("/trainer/edit/:id", requireAuth, adminController.getEditTrainer);
router.post("/trainer/edit/", requireAuth, adminController.editPostTrainer);
router.post("/del_trainer", requireAuth, adminController.deleteTrainer);

router.get("/report", requireAuth, adminController.getReport);

router.get("/logout", requireAuth, adminController.getLogout);

module.exports = router;
