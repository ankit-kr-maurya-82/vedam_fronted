import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContextProvider";

const ProtectedRoute = () => {
  const { user, loading } = useUser();

  if (loading) return null; // or loader

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
