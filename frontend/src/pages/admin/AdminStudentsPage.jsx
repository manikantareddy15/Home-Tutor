import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminStudentsPage = () => {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/admin/students").then((r)=>setList(r.data.students)); }, []);
  return <div className="card"><h3 className="font-semibold mb-2">Students</h3>{list.map((s)=><div key={s._id} className="text-sm border rounded p-2 mb-2">{s.fullName} | {s.email}</div>)}</div>;
};
export default AdminStudentsPage;
