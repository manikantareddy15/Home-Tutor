import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
const AdminDashboardPage = () => {
  const [data, setData] = useState({ stats: {}, recentSessions: [] });
  useEffect(() => { api.get("/admin/dashboard").then((r)=>setData(r.data)); }, []);
  const s = data.stats || {};
  return <div className="space-y-4"><div className="grid md:grid-cols-4 gap-4"><StatCard title="Total Tutors" value={s.totalTutors || 0}/><StatCard title="Total Students" value={s.totalStudents || 0}/><StatCard title="Sessions Today" value={s.sessionsToday || 0}/><StatCard title="Pending Approvals" value={s.pendingApprovals || 0}/></div><div className="card"><h3 className="font-semibold mb-2">Live & Recent Sessions</h3>{(data.recentSessions||[]).map((x)=><div key={x._id} className="text-sm border rounded p-2 mb-2">{x.subject} | {x.student?.fullName} with {x.tutor?.fullName}</div>)}</div></div>;
};
export default AdminDashboardPage;
