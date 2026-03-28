import { useEffect, useState } from "react";
import api from "../../services/api";
const AdminApprovalsPage = () => {
  const [list, setList] = useState([]);
  const load = () => api.get("/admin/tutors").then((r)=>setList(r.data.tutors.filter((t)=>!t.isApproved)));
  useEffect(load, []);
  const action = async (id, approved) => { await api.patch(/tutors//approve, { approved }); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Tutor Approvals</h3>{list.map((t)=><div key={t._id} className="text-sm border rounded p-2 mb-2">{t.fullName}<button className="ml-2 px-2 py-1 rounded bg-emerald-600 text-white" onClick={()=>action(t._id,true)}>Accept</button><button className="ml-2 px-2 py-1 rounded bg-rose-600 text-white" onClick={()=>action(t._id,false)}>Reject</button></div>)}</div>;
};
export default AdminApprovalsPage;
