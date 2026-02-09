"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patient: "",
    date: "",
    time: "",
    chair: 1
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🔹 Load patients
  const loadPatients = async () => {
    const res = await fetch("http://localhost:5000/api/patients", {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    const data = await res.json();
    setPatients(data);
  };

  // 🔹 Load appointments
  const loadAppointments = async () => {
    const res = await fetch("http://localhost:5000/api/appointments", {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    const data = await res.json();
    setAppointments(data);
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    loadPatients();
    loadAppointments();
  }, []);

  // 🔹 Create appointment
  const createAppointment = async () => {
    if (!form.patient || !form.date || !form.time) {
      alert("Fill all fields");
      return;
    }

    await fetch("http://localhost:5000/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });

    setForm({ patient: "", date: "", time: "", chair: 1 });
    loadAppointments();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Appointments</h1>

      {/* ADD APPOINTMENT FORM */}
      <div style={{ marginBottom: 30 }}>
        <h3>Add Appointment</h3>

        <select
          value={form.patient}
          onChange={e => setForm({ ...form, patient: e.target.value })}
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />

        <br /><br />

        <input
          type="time"
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
        />

        <br /><br />

        <select
          value={form.chair}
          onChange={e => setForm({ ...form, chair: Number(e.target.value) })}
        >
          <option value={1}>Chair 1</option>
          <option value={2}>Chair 2</option>
          <option value={3}>Chair 3</option>
        </select>

        <br /><br />

        <button onClick={createAppointment}>Add Appointment</button>
      </div>

      {/* APPOINTMENT LIST */}
      <ul>
        {appointments.map(a => (
          <li key={a._id}>
            <b>{a.patient?.name}</b> — {a.date} {a.time} — Chair {a.chair}
          </li>
        ))}
      </ul>
    </div>
  );
}
