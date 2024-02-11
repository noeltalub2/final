const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin.controller");
const { requireAuth, forwardAuth } = require("../middleware/trainer.auth");

router.get("/signin", adminController.getLogin);
router.post("/signin", adminController.postLogin);

router.get("/dashboard", adminController.getDashboard);

router.get("/client", adminController.getClient);
// router.get("/client", requireAuth, adminController.getClient);
router.get("/client/:username", adminController.getClientView);
router.post("/client", adminController.updateProfile);
router.post("/del_client", adminController.deleteClient);

router.get("/equipment", adminController.getEquipment);
router.get("/add_equipment", adminController.addEquipment);
router.post("/add_equipment", adminController.postAddEquipment);

router.get("/edit_equipment/:id", adminController.editEquipment);
router.post("/edit_equipment/", adminController.postEditEquipment);

router.post("/del_equipment", adminController.deleteEquipment);

router.get("/attendance", adminController.getAttendance);
router.get("/time-in/:id", adminController.postTimeIn);
router.get("/time-out/:id", adminController.postTimeOut);

router.get("/attendance/history", adminController.getHistoryAttendance);

router.get("/membership", adminController.getMembership);

router.get("/membership/upcoming", adminController.getUpcomingMembership);
router.get("/membership/upcoming/:id", adminController.getPaymentMembership);
router.post("/confirm_payment", adminController.confirmPayment);
router.post("/alert_payment", adminController.alertPayment);
router.post("/cancel_membership", adminController.cancelMembership);

router.get("/announcement", adminController.getAnnouncement);
router.post("/announcement", adminController.postAnnouncement);
router.post("/announcement/edit", adminController.editAnnouncement);
router.post("/announcement/delete", adminController.deleteAnnouncement);

router.get("/trainer", adminController.getTrainer);
router.get("/trainer/add", adminController.addTrainer);
router.post("/trainer/add", adminController.postTrainer);
router.get("/trainer/edit/:id", adminController.getEditTrainer);
router.post("/trainer/edit/", adminController.editPostTrainer);
router.post("/del_trainer", adminController.deleteTrainer);

router.get("/logout", adminController.getLogout);

module.exports = router;
