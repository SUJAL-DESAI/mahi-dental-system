const Appointment = require("../models/Appointment");

// CREATE appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient, date, time, chair } = req.body;

    // 🔴 check overlapping
    const exists = await Appointment.findOne({
      date,
      time,
      chair
    });

    if (exists) {
      return res.status(400).json({
        message: "Chair already booked at this time"
      });
    }

    const appointment = await Appointment.create({
      patient,
      date,
      time,
      chair
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json(err.message);
  }
};


// GET all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
