import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleForm = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return;
    }
    if (password !== confirmPassword) {
      alert("Password and confirm password doesn't match");
      return;
    }

    try {
      const { data: response } = await registerUser({
        username,
        email,
        password,
      });
      setUser(response.user);
      setToken(response.token);

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", JSON.stringify(response.token));
      navigate("/"); // Redirect to the chat page after successful login
    } catch (error) {
      toast.error(error.response.data.msg || error?.error);
    }
  };
  return (
    <div className="flex items-center justify-center min-w-screen min-h-screen text-white">
      <form
        className="bg-slate-800 p-8 rounded-xl w-[400px]"
        onSubmit={handleForm}
      >
        <h1 className="text-center text-3xl mb-4 ">Register</h1>
        <div className="mb-4">
          <label htmlFor="username" className="mb-1 block">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter Username"
            className="w-full p-2 text-black text-md rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full p-2 text-md text-black rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 block">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-2 text-black text-md rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="mb-1 block">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Enter Confirm Password"
            className="w-full p-2 text-black text-md rounded border-2 border-cyan-700 outline-0 focus:border-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 rounded text-center w-full mt-2">
          Register
        </button>
        <p className="mt-2 text-center">
          Already have an account?{" "}
          <Link to="/login" className="underline text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
