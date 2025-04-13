import { Navigate, Outlet } from "react-router-dom";

const RoleRouter = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/loginad" />; // Nếu chưa đăng nhập
  }

  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/admin" />; // Nếu sai role
  }

  return <Outlet />;;
};

export default RoleRouter;