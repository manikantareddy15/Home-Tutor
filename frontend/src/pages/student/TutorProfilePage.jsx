import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
const TutorProfilePage = () => {
  const { id } = useParams(); const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [form, setForm] = useState({ subject: "", mode: "online", startTime: "", endTime: "" });
  useEffect(() => { api.get(/tutors/).then((r)=>{ setTutor(r.data.tutor); setForm((f)=>({ ...f, subject: r.data.tutor.subjects[0] || "" })); }); }, [id]);
  const book = async () => { try { await api.post("/bookings", { tutorId: id, ...form }); toast.success("Booking requested"); navigate("/student/bookings"); } catch (e) { toast.error(e.response?.data?.message || "Booking failed"); } };
  if (!tutor) return <div className="card">Loading...</div>;
  return <div className="card space-y-2"><h2 className="text-xl font-bold">{tutor.fullName}</h2><p className="text-sm">{tutor.bio || "Experienced tutor"}</p><select className="w-full border p-2 rounded" value={form.subject} onChange={(e)=>setForm({ ...form, subject: e.target.value })}>{tutor.subjects.map((s)=><option key={s}>{s}</option>)}</select><select className="w-full border p-2 rounded" value={form.mode} onChange={(e)=>setForm({ ...form, mode: e.target.value })}><option value="online">Online</option><option value="offline">Offline</option></select><input type="datetime-local" className="w-full border p-2 rounded" value={form.startTime} onChange={(e)=>setForm({ ...form, startTime: e.target.value })}/><input type="datetime-local" className="w-full border p-2 rounded" value={form.endTime} onChange={(e)=>setForm({ ...form, endTime: e.target.value })}/><p className="text-sm">Rate: Rs {tutor.hourlyRate}/hr</p><button onClick={book} className="px-4 py-2 rounded bg-indigo-600 text-white">Confirm Booking</button></div>;
};
export default TutorProfilePage;
