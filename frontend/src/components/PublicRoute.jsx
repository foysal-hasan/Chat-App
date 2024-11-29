import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { token, user } = useAuth();

  // If there is a valid token and user ID, navigate the user to the chat page
  if (token && user?._id) return <Navigate to="/" replace />;

  // If no token or user ID exists, render the child components as they are
  return children;
};

export default PublicRoute;
