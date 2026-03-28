import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const links = [{ to: "/admin", label: "Dashboard" }, { to: "/admin/tutors", label: "Tutors" }, { to: "/admin/students", label: "Students" }, { to: "/admin/approvals", label: "Tutor Approvals" }, { to: "/admin/sessions", label: "All Sessions" }, { to: "/admin/bookings", label: "Bookings" }];
const AdminLayout = () => <div className="p-4 md:p-8 space-y-4"><Navbar links={links} /><Outlet /></div>;
export default AdminLayout;
