"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [form, setForm] = useState({
    patient: "",
    appointment: "",
    items: [{ name: "", qty: 1, price: 0 }],
    discount: 0,
    paid: 0
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token
  };

  const load = async () => {
    const [p, a, i] = await Promise.all([
      fetch("http://localhost:5000/api/patients", { headers }).then(r => r.json()),
      fetch("http://localhost:5000/api/appointments", { headers }).then(r => r.json()),
      fetch("http://localhost:5000/api/invoices", { headers }).then(r => r.json())
    ]);
    setPatients(p);
    setAppointments(a);
    setInvoices(i);
  };

  useEffect(() => {
    if (!token) return router.push("/login");
    load();
  }, []);

  const addItem = () =>
    setForm({ ...form, items: [...form.items, { name: "", qty: 1, price: 0 }] });

  const updateItem = (i, k, v) => {
    const items = [...form.items];
    items[i][k] = k === "name" ? v : Number(v);
    setForm({ ...form, items });
  };

  const createInvoice = async () => {
    const res = await fetch("http://localhost:5000/api/invoices", {
      method: "POST",
      headers,
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const e = await res.json();
      return alert(e.message || "Failed");
    }
    setForm({
      patient: "",
      appointment: "",
      items: [{ name: "", qty: 1, price: 0 }],
      discount: 0,
      paid: 0
    });
    load();
  };

  const pay = async (id, amount) => {
    await fetch(`http://localhost:5000/api/invoices/${id}/pay`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ amount })
    });
    load();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Billing</h1>

      <h3>Create Invoice</h3>
      <select value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
        <option value="">Select Patient</option>
        {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
      </select>

      <br /><br />

      <select value={form.appointment} onChange={e => setForm({ ...form, appointment: e.target.value })}>
        <option value="">Select Appointment</option>
        {appointments.map(a => (
          <option key={a._id} value={a._id}>
            {a.patient?.name} — {a.date} {a.time}
          </option>
        ))}
      </select>

      <br /><br />

      {form.items.map((it, i) => (
        <div key={i}>
          <input placeholder="Item" value={it.name}
            onChange={e => updateItem(i, "name", e.target.value)} />
          <input type="number" placeholder="Qty" value={it.qty}
            onChange={e => updateItem(i, "qty", e.target.value)} />
          <input type="number" placeholder="Price" value={it.price}
            onChange={e => updateItem(i, "price", e.target.value)} />
        </div>
      ))}

      <button onClick={addItem}>Add Item</button>

      <br /><br />

      <input type="number" placeholder="Discount"
        value={form.discount}
        onChange={e => setForm({ ...form, discount: Number(e.target.value) })} />

      <input type="number" placeholder="Paid"
        value={form.paid}
        onChange={e => setForm({ ...form, paid: Number(e.target.value) })} />

      <br /><br />

      <button onClick={createInvoice}>Create Invoice</button>

      <hr />

      <h3>Invoices</h3>
      <ul>
        {invoices.map(inv => (
          <li key={inv._id} style={{ marginBottom: 10 }}>
            <b>{inv.patient?.name}</b> — Total ₹{inv.total} — Due ₹{inv.due} — {inv.status}
            {inv.due > 0 && (
              <button onClick={() => {
                const amt = prompt("Pay amount");
                if (amt) pay(inv._id, Number(amt));
              }}>
                Add Payment
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
