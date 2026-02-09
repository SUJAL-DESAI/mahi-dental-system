"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5000/api/appointments", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Appointments</h1>

      <ul>
        {appointments.map(a => (
          <li key={a._id}>
            {a.patient?.name} — {a.date} {a.time} — Chair {a.chair}
          </li>
        ))}
      </ul>
    </div>
  );
}
