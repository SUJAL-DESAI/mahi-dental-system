const Invoice = require("../models/Invoice");

// helper
const calc = (items, discount = 0, paid = 0) => {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = Math.max(subtotal - discount, 0);
  const due = Math.max(total - paid, 0);
  const status = due === 0 ? "paid" : paid > 0 ? "partial" : "unpaid";
  return { subtotal, total, due, status };
};

// CREATE invoice
exports.createInvoice = async (req, res) => {
  try {
    const { patient, appointment, items, discount = 0, paid = 0 } = req.body;

    const { subtotal, total, due, status } = calc(items, discount, paid);

    const invoice = await Invoice.create({
      patient,
      appointment,
      items,
      discount,
      paid,
      subtotal,
      total,
      due,
      status
    });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET invoices
exports.getInvoices = async (_req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("patient")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD payment
exports.addPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const paid = invoice.paid + Number(amount || 0);
    const { subtotal, total, due, status } = calc(
      invoice.items,
      invoice.discount,
      paid
    );

    invoice.paid = paid;
    invoice.subtotal = subtotal;
    invoice.total = total;
    invoice.due = due;
    invoice.status = status;

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
