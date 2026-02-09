const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  addPayment
} = require("../controllers/invoiceController");

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.put("/:id/pay", protect, addPayment);

module.exports = router;
