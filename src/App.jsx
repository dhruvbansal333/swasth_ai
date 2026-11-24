import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import BasicAssessment from "./pages/BasicAssessment";
import AdvancedAssessment from "./pages/AdvancedAssessment";
import Analytics from "./pages/Analytics";
import Guidance from "./pages/Guidance";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Predict from "./pages/Predict";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Clinical Assessment Routes */}
              <Route path="/assessment/basic" element={<BasicAssessment />} />
              <Route path="/assessment/advanced" element={<AdvancedAssessment />} />
              <Route path="/predict" element={<Predict />} />

              {/* Analytics & Guidance */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/guidance" element={<Guidance />} />

              {/* Protected Patient Routes */}
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
