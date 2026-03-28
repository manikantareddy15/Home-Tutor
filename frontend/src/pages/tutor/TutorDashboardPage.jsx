import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
const TutorDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  const ongoing = bookings.filter((b)=>b.status==="ongoing");
  return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><StatCard title="Requests" value={bookings.filter((b)=>b.status==="pending").length} /><StatCard title="Today Sessions" value={bookings.length} /><StatCard title="Earnings" value={`Rs ${bookings.reduce((a,b)=>a+(b.totalPrice||0),0)}`} /></div><div className="card"><h3 className="font-semibold mb-2">Today's Sessions</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} - {b.mode} - {b.status} {b.mode==="online" && b.status==="ongoing" ? <button className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded">JOIN</button> : null}</div>)}{ongoing.length ? <p className="text-xs text-slate-500">OTP is generated when session set to ongoing.</p> : null}</div></div>;
};
export default TutorDashboardPage;
