"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "male"
  });
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadPatients();
  }, []);

  // 🔹 Add or Update
  const submitPatient = async () => {
    const url = editingId
      ? `http://localhost:5000/api/patients/${editingId}`
      : "http://localhost:5000/api/patients";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });

    setForm({ name: "", phone: "", age: "", gender: "male" });
    setEditingId(null);
    loadPatients();
  };

  // 🔹 Delete
  const deletePatient = async id => {
    if (!confirm("Delete patient?")) return;

    await fetch(`http://localhost:5000/api/patients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    loadPatients();
  };

  // 🔹 Edit
  const editPatient = patient => {
    setForm({
      name: patient.name,
      phone: patient.phone,
      age: patient.age || "",
      gender: patient.gender || "male"
    });
    setEditingId(patient._id);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Patients</h1>

      {/* FORM */}
      <div style={{ marginBottom: 30 }}>
        <h3>{editingId ? "Edit Patient" : "Add Patient"}</h3>

        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <br />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <br />

        <input
          placeholder="Age"
          value={form.age}
          onChange={e => setForm({ ...form, age: e.target.value })}
        />
        <br />

        <select
          value={form.gender}
          onChange={e => setForm({ ...form, gender: e.target.value })}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <br />

        <button onClick={submitPatient}>
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* LIST */}
      <ul>
        {patients.map(p => (
          <li key={p._id} style={{ marginBottom: 10 }}>
            <b>{p.name}</b> — {p.phone}

            <button onClick={() => editPatient(p)}>Edit</button>
            <button onClick={() => deletePatient(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
