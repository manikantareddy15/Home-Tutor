import { useState } from "react";
import api from "../../services/api";
const StudentMessagesPage = () => {
  const [withUser, setWithUser] = useState(""); const [messages, setMessages] = useState([]); const [content, setContent] = useState("");
  const load = async () => { const { data } = await api.get("/messages", { params: { withUser } }); setMessages(data.messages); };
  const send = async () => { await api.post("/messages", { to: withUser, content }); setContent(""); load(); };
  return <div className="card space-y-2"><input className="w-full border p-2 rounded" placeholder="Tutor/Student user id" value={withUser} onChange={(e)=>setWithUser(e.target.value)} /><button className="px-3 py-1 rounded bg-slate-200" onClick={load}>Load Chat</button><div className="h-64 overflow-auto border rounded p-2 bg-slate-50">{messages.map((m)=><div key={m._id} className="text-sm mb-1">{m.from?.fullName}: {m.content}</div>)}</div><div className="flex gap-2"><input className="flex-1 border p-2 rounded" value={content} onChange={(e)=>setContent(e.target.value)} /><button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={send}>Send</button></div></div>;
};
export default StudentMessagesPage;
