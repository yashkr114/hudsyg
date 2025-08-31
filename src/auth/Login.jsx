import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo1.png";
import BACKGROUND_IMAGE_LOGIN_PAGE from "../assets/background.png";
import {APP_NAME, FOOTER_TEXT } from "../constants";

function Login() {
  // State variables for form fields and UI state
  const [gid_no, setGidNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forceSetPassword, setForceSetPassword] = useState(false);
  const [loginRole, setLoginRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated (token exists and not expired)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check token expiry
        if (payload.exp && Date.now() / 1000 < payload.exp) {
          if (payload.role === "admin") navigate("/admin", { replace: true });
          else if (payload.role === "team") navigate("/team", { replace: true });
          else if (payload.role === "client") navigate("/client", { replace: true });
        }
      } catch {
        // Invalid token, do nothing (show login)
      }
    }
  }, [navigate]);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
   
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", { gid_no, password });
      // Check for auto-generated password for team/client
      if ((res.data.role === "team" || res.data.role === "client") && password === `${gid_no}@Vmo2`) {
        setLoginRole(res.data.role);
        setUserId(res.data.userId);
        setForceSetPassword(true);
        setLoading(false);
        navigate("/auth/set-password", { state: { gid_no, user_id: res.data.userId, role: res.data.role, autoMode: true } });
        return;
      }
      
      // Success animation
      setRedirecting(true);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      
      // Redirect after animation
      setTimeout(() => {
        if (res.data.role === "admin") navigate("/admin");
        else if (res.data.role === "team") navigate("/team");
        else if (res.data.role === "client") navigate("/client");
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  // If force set password, render SetPassword component
  if (forceSetPassword) {
    return <SetPassword gid_no={gid_no} user_id={userId} role={loginRole} autoMode={true} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background image with enhanced overlay */}
      <img
        src={BACKGROUND_IMAGE_LOGIN_PAGE}
        alt="Telecommunication Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Enhanced gradient overlay for better blending */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40 z-0" />
      <div className="absolute inset-0 bg-black/10 z-0" />
      
      {/* Success Overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-green-200 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Login Successful!</h3>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
              <div className="mt-4">
                <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full animate-progress"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Card with improved glass morphism */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md mx-3 sm:mx-4 animate-slide-up">
        {/* Glass card container */}
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Logo and header */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 shadow-xl border border-white/40 animate-float">
                <div className="bg-white rounded-full p-1.5 sm:p-2 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 shadow-inner">
                  <img src={logo} alt="Company Logo" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight text-center drop-shadow-lg">
                Welcome to {APP_NAME} Portal
              </h2>
              <p className="text-white/80 text-xs sm:text-sm text-center font-medium">
                Sign in to your {APP_NAME} Portal
              </p>
            </div>

            {/* Error message with improved styling */}
            {errorMsg && (
              <div className="mb-4 sm:mb-6 text-red-100 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm shadow-lg animate-shake">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="break-words">{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* GID Input */}
              <div className="animate-slide-in-left">
                <label htmlFor="gid_no" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                  GID Number
                </label>
                <div className="relative">
                  <input
                    id="gid_no"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 placeholder-white/60 text-sm sm:text-base"
                    value={gid_no}
                    onChange={e => setGidNo(e.target.value.replace(/\D/g, ""))}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData('Text');
                      if (!/^\d+$/.test(pasted)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter your GID"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div className="animate-slide-in-right">
                <label htmlFor="password" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 placeholder-white/60 text-sm sm:text-base"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 hover:scale-110"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.25-2.61A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="animate-slide-in-up">
                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg flex items-center justify-center shadow-xl border border-blue-500/30 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="text-sm sm:text-base">Signing in...</span>
                    </div>
                  ) : redirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse h-4 w-4 sm:h-5 sm:w-5 bg-white rounded-full"></div>
                      <span className="text-sm sm:text-base">Redirecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Sign In</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Forgot Password Link */}
            <div className="flex justify-center mt-3 sm:mt-4 animate-fade-in-delayed">
              <button
                type="button"
                className="text-xs sm:text-sm text-white/80 hover:text-white hover:underline focus:outline-none transition-all duration-200 font-medium hover:scale-105"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Forgot your password?
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center text-white/60 text-xs animate-fade-in-delayed">
              <div className="border-t border-white/20 pt-3 sm:pt-4">
                &copy; {new Date().getFullYear()} {FOOTER_TEXT}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-delayed {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out 0.1s both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out 0.2s both;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out 0.3s both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        
        .animate-progress {
          animation: progress 1.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
