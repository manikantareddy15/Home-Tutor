import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminSessionsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">All Sessions</h3>{bookings.map((b)=><div key={b._id} className="text-sm border rounded p-2 mb-2">{b.subject} - {b.mode} - {b.status}</div>)}</div>;
};
export default AdminSessionsPage;
