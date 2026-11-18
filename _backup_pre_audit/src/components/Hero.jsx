import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative flex flex-col items-center justify-center pt-16 pb-10 px-6 bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200">

      <div className="blob"></div>

      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl text-center relative z-10">

        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700">
          Predict Early. Prevent Smartly.
        </h2>

        <p className="mb-6 text-lg text-gray-700">
          AI-Based Cardiometabolic Risk Intelligence Platform
        </p>

        <Link
          to="/login"
          className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition duration-300 shadow-lg"
        >
          Check Your Risk
        </Link>

      </div>
    </div>
  );
}