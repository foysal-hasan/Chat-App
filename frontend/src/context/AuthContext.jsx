import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser, registerUser } from "../api";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

// Create a context to manage authentication-related data and functions
const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Create a hook to access the AuthContext
const useAuth = () => useContext(AuthContext);

// Create a component that provides authentication-related data and functions
const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  //   const navigate = useNavigate();

  // Function to handle user login
  const login = async (data) => {
    try {
      const { data: response } = await loginUser(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", JSON.stringify(response.token));
      //   navigate("/"); // Redirect to the chat page after successful login
    } catch (error) {
      toast.error(error.response.data.msg || error?.error);
    }
  };

  // Function to handle user registration
  const register = async (data) => {
    try {
      const { data: response } = await registerUser(data);
      setUser(response.user);
      setToken(response.token);
      console.log(data);

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", JSON.stringify(response.token));
      //   navigate("/"); // Redirect to the chat page after successful login
    } catch (error) {
      toast.error(error.response.data.msg || error?.error);
    }
  };

  // Function to handle user logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      localStorage.clear(); // Clear local storage on logout
      //   navigate("/login"); // Redirect to the login page after successful logout
    } catch (error) {
      toast.error(error.response.data.msg || error?.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for saved user and token in local storage during component initialization
  useEffect(() => {
    setIsLoading(true);
    const _token = localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("token"))
      : null;
    const _user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, [setToken, setUser]);

  // Provide authentication-related data and functions through the context
  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, token, setToken, setUser }}
    >
      {isLoading ? <Loader /> : children} {/* Display a loader while loading */}
    </AuthContext.Provider>
  );
};

// Export the context, provider component, and custom hook
export { AuthContext, AuthProvider, useAuth };
