"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

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

  // 🔹 Load patients for dropdown
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

    const res = await fetch("http://localhost:5000/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Failed to create appointment");
      return;
    }

    setForm({ patient: "", date: "", time: "", chair: 1 });
    loadAppointments();
  };

  // 🔹 Update appointment status
  const updateStatus = async (id, status) => {
    await fetch(
      `http://localhost:5000/api/appointments/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status })
      }
    );

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

      {/* DATE FILTER */}
      <div style={{ marginBottom: 20 }}>
        <h3>Filter by Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>

      {/* APPOINTMENT LIST */}
      <ul>
        {appointments
          .filter(a => !selectedDate || a.date === selectedDate)
          .map(a => (
            <li key={a._id} style={{ marginBottom: 10 }}>
              <b>{a.patient?.name}</b> — {a.date} {a.time} — Chair {a.chair}

              <select
                value={a.status}
                onChange={e => updateStatus(a._id, e.target.value)}
                style={{ marginLeft: 10 }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </li>
          ))}
      </ul>
    </div>
  );
}
