import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminTutorsPage = () => {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/admin/tutors").then((r)=>setList(r.data.tutors)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Tutors</h3>{list.map((t)=><div key={t._id} className="text-sm border rounded p-2 mb-2">{t.fullName} | {t.subjects?.join(", ")} | {t.isApproved ? "approved" : "pending"}</div>)}</div>;
};
export default AdminTutorsPage;
