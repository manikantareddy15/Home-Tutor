import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings.filter((b)=>["completed","cancelled","rejected"].includes(b.status)))); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Session History</h3>{bookings.map((b)=><div key={b._id} className="border rounded p-2 mb-2 text-sm">{b.subject} - {b.status}</div>)}</div>;
};
export default TutorHistoryPage;
