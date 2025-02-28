import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
  const { user } = useAuth();
  console.log("User từ useAuth:", user); // Debug xem user có đúng không

  if (!user) {
    return <Navigate to="/loginad" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
