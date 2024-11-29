import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleForm = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    try {
      const { data: response } = await loginUser({ username, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", JSON.stringify(response.token));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.msg || error?.error);
    }

    // console.log(username, password);
  };
  return (
    <div className="flex items-center justify-center min-w-screen min-h-screen">
      <form
        className="bg-slate-800 p-8 rounded-xl w-[400px]"
        onSubmit={handleForm}
      >
        <h1 className="text-center text-3xl mb-4 text-white">Login</h1>
        <div className="mb-4">
          <label htmlFor="username" className="mb-1 block text-white">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter Username"
            className="w-full p-2 text-md rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 block text-white">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 text-md rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="px-4 py-2 bg-blue-600 rounded text-center w-full mt-2 text-white">
          Login
        </button>
        <p className="mt-2 text-center text-white">
          Create an account?{" "}
          <Link to="/register" className="underline text-blue-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
