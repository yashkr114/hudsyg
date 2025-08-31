import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { COMMON_PASSWORD_REGEX, COMMON_PASSWORD_RULES, FOOTER_TEXT } from "../constants/index";
import BACKGROUND_IMAGE_LOGIN_PAGE from "../assets/background.png";

function ForgetPassword() {
  // --- State management ---
  const [step, setStep] = useState(1); // 1: GID, 2: OTP, 3: New Password
  const [gid, setGid] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // --- Step 1: Request OTP ---
  const handleGidSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/request-password-reset", { gid_no: gid });
      setStep(2);
      setSuccess("OTP sent to your registered email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  // --- Step 2: Verify OTP ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/verify-otp", { gid_no: gid, otp });
      setStep(3);
      setSuccess("");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    }
    setLoading(false);
  };

  // --- Step 3: Reset Password ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!COMMON_PASSWORD_REGEX.test(newPassword)) {
      setError("Password does not meet the required rules.");
      setShowRules(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setShowRules(false);
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/reset-password", {
        gid_no: gid,
        otp,
        newPassword,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setShowRules(false);
      setRedirecting(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    }
    setLoading(false);
  };

  // --- Step titles and descriptions ---
  const getStepTitle = () => {
    switch (step) {
      case 1: return "Enter Your GID";
      case 2: return "Verify OTP";
      case 3: return "Set New Password";
      default: return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your GID number to receive an OTP";
      case 2: return "Enter the OTP sent to your registered email";
      case 3: return "Create a strong new password for your account";
      default: return "Reset your password";
    }
  };

  // --- Password validation rules ---
  const passwordRules = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  // --- UI rendering ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* --- Background image --- */}
      <img
        src={BACKGROUND_IMAGE_LOGIN_PAGE}
        alt="Telecommunication Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* --- Gradient overlays --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40 z-0" />
      <div className="absolute inset-0 bg-black/10 z-0" />

      {/* --- Success overlay after password reset --- */}
      {redirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-green-200 animate-scale-in max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Redirecting to login page...</p>
              <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Card --- */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md mx-3 sm:mx-4 animate-slide-up">
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* --- Logo and header --- */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 shadow-xl border border-white/40 animate-float">
                <div className="bg-white rounded-full p-1.5 sm:p-2 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 shadow-inner">
                  <img src={logo} alt="Company Logo" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 tracking-tight text-center drop-shadow-lg">
                {getStepTitle()}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm text-center font-medium mb-3 sm:mb-4 px-2">
                {getStepDescription()}
              </p>
              {/* --- Progress indicator --- */}
              <div className="flex items-center gap-1 sm:gap-2 mb-2 animate-fade-in">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      step >= stepNum 
                        ? 'bg-blue-500 text-white shadow-lg scale-110' 
                        : 'bg-white/30 text-white/60'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-6 sm:w-8 h-1 mx-0.5 sm:mx-1 rounded transition-all duration-300 ${
                        step > stepNum ? 'bg-blue-500' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs">Step {step} of 3</p>
            </div>

            {/* --- Error/Success messages --- */}
            {error && (
              <div className="mb-4 sm:mb-6 text-red-100 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm shadow-lg animate-shake">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="break-words">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 sm:mb-6 text-green-100 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm shadow-lg animate-bounce">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="break-words">{success}</span>
                </div>
              </div>
            )}

            {/* --- Step 1: GID Input --- */}
            {step === 1 && (
              <form onSubmit={handleGidSubmit} className="space-y-4 sm:space-y-6">
                <div className="animate-slide-in">
                  <label htmlFor="forgot-gid" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                    GID Number
                  </label>
                  <div className="relative">
                    <input
                      id="forgot-gid"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 placeholder-white/60 text-sm sm:text-base"
                      value={gid}
                      onChange={e => setGid(e.target.value.replace(/\D/g, ""))}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg flex items-center justify-center shadow-xl border border-blue-500/30 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] animate-slide-in-up"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="text-sm sm:text-base">Sending OTP...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Send OTP</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* --- Step 2: OTP Input --- */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-6">
                <div className="animate-slide-in">
                  <label htmlFor="otp" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                    OTP Code
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      type="text"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 placeholder-white/60 text-sm sm:text-base text-center tracking-widest"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/, ""))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg flex items-center justify-center shadow-xl border border-blue-500/30 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] animate-slide-in-up"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="text-sm sm:text-base">Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Verify OTP</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  className="w-full text-white/80 hover:text-white text-xs sm:text-sm underline font-medium hover:scale-105 transition-all duration-200 animate-fade-in"
                  onClick={() => setStep(1)}
                >
                  ← Back to GID Entry
                </button>
              </form>
            )}

            {/* --- Step 3: New Password --- */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                <div className="animate-slide-in">
                  <label htmlFor="new-password" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 placeholder-white/60 text-sm sm:text-base"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      onFocus={() => setShowRules(true)}
                      onBlur={() => setTimeout(() => setShowRules(false), 200)}
                    />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                    <button
                      type="button"
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all duration-200 p-1 hover:scale-110"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.25-2.61A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* --- Password strength indicator --- */}
                  {showRules && newPassword && (
                    <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl animate-slide-down">
                      <h4 className="text-white font-medium text-xs sm:text-sm mb-2 sm:mb-3">Password Requirements:</h4>
                      <div className="space-y-1.5 sm:space-y-2">
                        {Object.entries(passwordRules).map(([key, isValid]) => (
                          <div key={key} className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isValid ? 'bg-green-500 scale-110' : 'bg-white/30'
                            }`}>
                              {isValid && <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>}
                            </div>
                            <span className={`transition-colors duration-200 ${isValid ? 'text-green-300' : 'text-white/70'}`}>
                              {key === 'minLength' && 'At least 8 characters'}
                              {key === 'hasUppercase' && 'One uppercase letter'}
                              {key === 'hasLowercase' && 'One lowercase letter'}
                              {key === 'hasNumber' && 'One number'}
                              {key === 'hasSpecialChar' && 'One special character'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="animate-slide-in-delayed">
                  <label htmlFor="confirm-password" className="block text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-transparent transition-all duration-200 pr-10 sm:pr-12 placeholder-white/60 text-sm sm:text-base"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-white/20 pointer-events-none" />
                    <button
                      type="button"
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all duration-200 p-1 hover:scale-110"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.25-2.61A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* --- Password match indicator --- */}
                  {confirmPassword && (
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm animate-slide-in">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        newPassword === confirmPassword ? 'bg-green-500 scale-110' : 'bg-red-500'
                      }`}>
                        <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          {newPassword === confirmPassword ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                      <span className={`transition-colors duration-200 ${newPassword === confirmPassword ? 'text-green-300' : 'text-red-300'}`}>
                        {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg flex items-center justify-center shadow-xl border border-green-500/30 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] animate-slide-in-up"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="text-sm sm:text-base">Resetting...</span>
                    </div>
                  ) : redirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse h-4 w-4 sm:h-5 sm:w-5 bg-white rounded-full"></div>
                      <span className="text-sm sm:text-base">Redirecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Reset Password</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  className="w-full text-white/80 hover:text-white text-xs sm:text-sm underline font-medium hover:scale-105 transition-all duration-200 animate-fade-in"
                  onClick={() => setStep(2)}
                >
                  ← Back to OTP Verification
                </button>
              </form>
            )}

            {/* --- Back to Login --- */}
            <div className="flex justify-center mt-4 sm:mt-6 animate-fade-in-delayed">
              <button
                type="button"
                className="text-xs sm:text-sm text-white/80 hover:text-white hover:underline focus:outline-none transition-all duration-200 font-medium hover:scale-105"
                onClick={() => navigate("/auth/login")}
              >
                Remember your password? Sign in
              </button>
            </div>

            {/* --- Footer --- */}
            <div className="mt-6 sm:mt-8 text-center text-white/60 text-xs animate-fade-in-delayed">
              <div className="border-t border-white/20 pt-3 sm:pt-4">
                &copy; {new Date().getFullYear()} {FOOTER_TEXT}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Custom Styles --- */}
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
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-delayed {
          from {
            opacity: 0;
            transform: translateX(-20px);
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
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        .animate-slide-in-delayed {
          animation: slide-in-delayed 0.4s ease-out 0.1s both;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.4s ease-out;
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
          animation: progress 2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ForgetPassword;
