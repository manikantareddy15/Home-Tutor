import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
const Navbar = ({ links }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="card flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4">
      <h1 className="font-bold text-lg sm:text-2xl text-indigo-600">HomeTutor</h1>
      <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap justify-center sm:justify-start">
        {links.map((l) => <Link key={l.to} to={l.to} className="hover:text-indigo-600 px-2 py-1">{l.label}</Link>)}
      </div>
      <button className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 px-3 py-1 border border-rose-600 rounded hover:bg-rose-50" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </div>
  );
};
export default Navbar;
