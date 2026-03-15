const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroup,
  deleteGroup,
  addExpense,
  deleteExpense,
  getSettlements,
} = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getGroups).post(createGroup);
router.route("/:id").get(getGroup).delete(deleteGroup);
router.route("/:id/expenses").post(addExpense);
router.route("/:id/expenses/:eid").delete(deleteExpense);
router.route("/:id/settlements").get(getSettlements);

module.exports = router;
