import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo login validation
    if (email && password) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/predict");
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-white">

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="bg-white/80 backdrop-blur-xl p-10 rounded-2xl border border-white shadow-xl w-full max-w-md animate-fadeIn"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login to SwasthAI
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:scale-105 shadow-lg transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}