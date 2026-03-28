import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
const FindTutorsPage = () => {
  const [subject, setSubject] = useState(""); const [tutors, setTutors] = useState([]);
  useEffect(() => { api.get("/tutors", { params: subject ? { subject } : {} }).then((r)=>setTutors(r.data.tutors)); }, [subject]);
  return (
    <div className="space-y-4">
      <div className="card"><input className="w-full border p-2 rounded" placeholder="Filter by subject" value={subject} onChange={(e)=>setSubject(e.target.value)} /></div>
      <div className="grid md:grid-cols-2 gap-4">
        {tutors.map((t) => (
          <div key={t._id} className="card">
            <h3 className="font-semibold">{t.fullName}</h3>
            <p className="text-sm text-slate-500">{t.subjects.join(", ")}</p>
            <p className="text-sm mt-1">Rs {t.hourlyRate}/hr | {t.experienceYears} yrs | Rating {t.rating}</p>
            <Link to={`/student/tutor/${t._id}`} className="text-indigo-600 text-sm mt-2 inline-block">View Profile</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FindTutorsPage;
