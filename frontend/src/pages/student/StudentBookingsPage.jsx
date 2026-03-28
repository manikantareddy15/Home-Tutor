import { useEffect, useState } from "react";
import api from "../../services/api";
const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Bookings</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} with {b.tutor?.fullName} - <span className="font-medium">{b.status}</span></div>)}</div>;
};
export default StudentBookingsPage;
