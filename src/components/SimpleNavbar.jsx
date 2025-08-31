import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function SimpleNavbar({
  title = "My Tasks",
  subtitle = "Track and manage your assigned tasks"
}) {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-between px-3 sm:px-6 lg:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex-shrink-0"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-gray-600 text-sm sm:text-base" />
        </button>
        <div className="min-w-0 flex-1">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 tracking-wide block truncate">
            {title}
          </span>
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{subtitle}</p>
        </div>
      </div>
    </nav>
  );
}

export default SimpleNavbar;
