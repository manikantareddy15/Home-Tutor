import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import StudentLayout from "../layouts/StudentLayout";
import TutorLayout from "../layouts/TutorLayout";
import AdminLayout from "../layouts/AdminLayout";
import StudentHomePage from "../pages/student/StudentHomePage";
import FindTutorsPage from "../pages/student/FindTutorsPage";
import TutorProfilePage from "../pages/student/TutorProfilePage";
import StudentBookingsPage from "../pages/student/StudentBookingsPage";
import StudentMessagesPage from "../pages/student/StudentMessagesPage";
import TutorDashboardPage from "../pages/tutor/TutorDashboardPage";
import TutorSchedulePage from "../pages/tutor/TutorSchedulePage";
import TutorRequestsPage from "../pages/tutor/TutorRequestsPage";
import TutorEarningsPage from "../pages/tutor/TutorEarningsPage";
import TutorHistoryPage from "../pages/tutor/TutorHistoryPage";
import TutorMessagesPage from "../pages/tutor/TutorMessagesPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminTutorsPage from "../pages/admin/AdminTutorsPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AdminApprovalsPage from "../pages/admin/AdminApprovalsPage";
import AdminSessionsPage from "../pages/admin/AdminSessionsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import NotificationsPage from "../pages/common/NotificationsPage";
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
      <Route index element={<StudentHomePage />} />
      <Route path="find-tutors" element={<FindTutorsPage />} />
      <Route path="tutor/:id" element={<TutorProfilePage />} />
      <Route path="bookings" element={<StudentBookingsPage />} />
      <Route path="messages" element={<StudentMessagesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
    <Route path="/tutor" element={<ProtectedRoute role="tutor"><TutorLayout /></ProtectedRoute>}>
      <Route index element={<TutorDashboardPage />} />
      <Route path="schedule" element={<TutorSchedulePage />} />
      <Route path="requests" element={<TutorRequestsPage />} />
      <Route path="earnings" element={<TutorEarningsPage />} />
      <Route path="history" element={<TutorHistoryPage />} />
      <Route path="messages" element={<TutorMessagesPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="tutors" element={<AdminTutorsPage />} />
      <Route path="students" element={<AdminStudentsPage />} />
      <Route path="approvals" element={<AdminApprovalsPage />} />
      <Route path="sessions" element={<AdminSessionsPage />} />
      <Route path="bookings" element={<AdminBookingsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
  </Routes>
);
export default AppRoutes;
