import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  // Destructure token and user details from the authentication context
  const { token, user } = useAuth();

  // If there's no token or user ID, redirect to the login page
  if (!token || !user?._id) return <Navigate to="/login" replace />;

  // If authenticated, render the child components
  return children;
};

export default PrivateRoute;
