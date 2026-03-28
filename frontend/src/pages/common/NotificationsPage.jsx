import { useEffect, useState } from "react";
import api from "../../services/api";
const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const load = () => api.get("/notifications").then((r)=>setItems(r.data.notifications));
  useEffect(load, []);
  const read = async (id) => { await api.patch(/notifications//read); load(); };
  const del = async (id) => { await api.delete(/notifications/); load(); };
  return <div className="card"><h3 className="font-semibold mb-2">Notifications</h3>{items.map((n)=><div key={n._id} className="text-sm border rounded p-2 mb-2"><div>{n.title}</div><div className="text-slate-500">{n.message}</div><div className="mt-1"><button className="text-xs text-indigo-600 mr-3" onClick={()=>read(n._id)}>Mark read</button><button className="text-xs text-rose-600" onClick={()=>del(n._id)}>Delete</button></div></div>)}</div>;
};
export default NotificationsPage;
