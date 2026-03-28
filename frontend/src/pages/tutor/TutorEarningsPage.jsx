import { useEffect, useState } from "react";
import api from "../../services/api";
const TutorEarningsPage = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => { api.get("/bookings").then((r)=>setBookings(r.data.bookings)); }, []);
  const total = bookings.filter((b)=>b.status==="completed").reduce((a,b)=>a+(b.totalPrice||0),0);
  return <div className="card"><h3 className="font-semibold mb-2">Earnings</h3><p className="text-2xl font-bold">Rs {total}</p><div className="mt-3 space-y-2">{bookings.map((b)=><div key={b._id} className="text-sm border rounded p-2">{b.subject} - Rs {b.totalPrice} - {b.status}</div>)}</div></div>;
};
export default TutorEarningsPage;
