import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white/70 backdrop-blur-lg border-b border-white/40 shadow-sm py-3 px-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo / Title */}
        <h1 className="text-2xl font-extrabold text-blue-700">
          SwasthAI
        </h1>

        {/* Navigation Links */}
        <div className="space-x-6 font-semibold text-gray-700">
          <Link
            to="/"
            className="hover:text-blue-600 transition duration-300"
          >
            Home
          </Link>

          <Link
            to="/predict"
            className="hover:text-blue-600 transition duration-300"
          >
            Predict Risk
          </Link>
        </div>

      </div>
    </nav>
  );
}