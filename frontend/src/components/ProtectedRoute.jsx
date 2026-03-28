import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
};
export default ProtectedRoute;
