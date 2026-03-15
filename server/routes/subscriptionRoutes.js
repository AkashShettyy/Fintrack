const express = require("express");
const router = express.Router();
const {
  addSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // all routes below are protected

router.route("/").get(getSubscriptions).post(addSubscription);
router.route("/:id").put(updateSubscription).delete(deleteSubscription);

module.exports = router;
