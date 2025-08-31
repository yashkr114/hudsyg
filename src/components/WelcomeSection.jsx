import React, { useState } from 'react';
import { FaUserTie, FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function WelcomeSection({ 
  userInfo, 
  title, 
  additionalInfo = [], 
  description,
  showReportingManager = false,
  reportingManagerText,
  loading = false
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 animate-pulse">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert role display text
  const getDisplayRole = (role) => {
    switch(role) {
      case 'client':
        return 'Employee';
      case 'team':
        return 'Team Lead';
      case 'admin':
        return 'Administrator';
      default:
        return role || 'Employee';
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-base sm:text-2xl font-bold flex-shrink-0 shadow-lg">
              {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : <FaUserTie />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <h2 className="text-base sm:text-2xl font-bold text-slate-800 truncate">
                  Welcome, {title || userInfo?.username || "User"}
                </h2>
              </div>
              {/* Mobile: Show dropdown for details with arrow icon */}
              <div className="block sm:hidden">
                <button
                  className={`flex items-center px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 gap-1`}
                  onClick={() => setShowDetails((v) => !v)}
                >
                  <span>{showDetails ? "Hide Details" : "Show Details"}</span>
                  {showDetails ? (
                    <FaChevronUp className="ml-1 text-base" />
                  ) : (
                    <FaChevronDown className="ml-1 text-base" />
                  )}
                </button>
                {showDetails && (
                  <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                      GID: {userInfo?.gid_no}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                      Role: {getDisplayRole(userInfo?.role)}
                    </span>
                    {userInfo?.email && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium truncate border border-slate-200 max-w-[100px]">
                        {userInfo.email}
                      </span>
                    )}
                    {userInfo?.phone && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                        {userInfo.phone}
                      </span>
                    )}
                    {additionalInfo.map((info, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                        {info.label && <span>{info.label}: </span>}{info.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Desktop: Always show details */}
              <div className="hidden sm:flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                  GID: {userInfo?.gid_no}
                </span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                  Role: {getDisplayRole(userInfo?.role)}
                </span>
                {userInfo?.email && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium truncate border border-slate-200 max-w-xs">
                    {userInfo.email}
                  </span>
                )}
                {userInfo?.phone && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                    {userInfo.phone}
                  </span>
                )}
                {additionalInfo.map((info, index) => (
                  <span key={index} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200">
                    {info.label && <span>{info.label}: </span>}{info.value}
                  </span>
                ))}
              </div>

              {userInfo?.application_names && userInfo.application_names.length > 0 && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200 text-xs">
                  Applications Enrolled: {userInfo.application_names.join(', ')}
                </span>
              )}

              
              {showReportingManager && reportingManagerText && (
                <div className="text-xs sm:text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-lg mt-2 border border-gray-200">
                  Reporting Manager: {reportingManagerText}
                </div>
              )}
              {description && (
                <p className="text-gray-600 text-xs sm:text-sm mt-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                  {description}
                </p>
              )}
            </div>
          </div>
          {/* Calendar section: hidden on mobile, visible on sm and up */}
          <div className="hidden sm:block text-left sm:text-right bg-gray-50 p-3 rounded-lg border border-gray-200 min-w-[150px]">
            <div className="flex items-center gap-2 mb-1 sm:justify-end">
              <FaCalendarAlt className="text-slate-600 text-sm" />
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Today's Date</p>
            </div>
            <p className="text-sm sm:text-lg font-bold text-slate-800">
              {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
