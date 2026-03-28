import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
const links = [{ to: "/tutor", label: "Dashboard" }, { to: "/tutor/schedule", label: "Schedule" }, { to: "/tutor/requests", label: "Booking Requests" }, { to: "/tutor/earnings", label: "Earnings" }, { to: "/tutor/history", label: "History" }, { to: "/tutor/messages", label: "Messages" }];
const TutorLayout = () => <div className="p-4 md:p-8 space-y-4"><Navbar links={links} /><Outlet /></div>;
export default TutorLayout;
