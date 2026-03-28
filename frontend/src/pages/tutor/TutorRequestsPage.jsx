import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorRequestsPage = () => {
  const [bookings, setBookings] = useState([]);
  const load = () => api.get("/bookings").then((r)=>setBookings(r.data.bookings.filter((b)=>b.status==="pending")));
  useEffect(load, []);
  const action = async (id, status) => { await api.patch(/bookings//status, { status }); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Booking Requests</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.student?.fullName} - {b.subject}<button className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white" onClick={()=>action(b._id,"confirmed")}>Accept</button><button className="ml-2 px-2 py-1 rounded bg-rose-600 text-white" onClick={()=>action(b._id,"rejected")}>Reject</button></div>)}</div>;
};
export default TutorRequestsPage;
