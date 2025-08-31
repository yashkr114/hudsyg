import React from 'react';
import { FaUserTie, FaBell, FaSignOutAlt, FaBars, FaTimes, FaBookOpen, FaHome } from 'react-icons/fa';
import { APP_NAME, APP_NAME_FULL } from '../constants';

function DashboardHeader({
  userInfo,
  title,
  subtitle,
  showUserGuide = false,
  onUserGuideClick,
  showNotifications = true,
  onNotificationClick,
  notificationBadge = false,
  notificationUrgent = false,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onLogout,
  additionalMobileMenuItems = [],
  loading = false
}) {
  const handleLogout = () => {
    localStorage.clear();
    window.location = "/auth/login";
  };

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
    <header className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-900 shadow-xl sticky top-0 z-50 border-b border-blue-600">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <FaHome className="text-slate-700 text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-600/50 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-700/30 rounded w-24 animate-pulse"></div>
                  </div>
                ) : (
                  <>
                  <h2 className="text-base sm:text-xl font-bold text-white truncate">{APP_NAME}</h2>
                    <h1 className="text-base sm:text-xl text-white truncate">
                      {title}
                    </h1>
                   
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* User Guide Button */}
              {showUserGuide && (
                <button
                  className="p-2 sm:p-3 bg-blue-700/80 hover:bg-blue-600/90 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg backdrop-blur-sm"
                  title="User Guide"
                  onClick={onUserGuideClick}
                >
                  <FaBookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              )}
              
              {/* Notifications */}
              {showNotifications && (
                <button 
                  onClick={onNotificationClick}
                  className={`relative p-2 sm:p-3 bg-blue-700/80 hover:bg-blue-600/90 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg backdrop-blur-sm ${
                    notificationUrgent ? 'text-red-300 animate-pulse' : notificationBadge ? 'text-yellow-300' : 'text-white'
                  }`}
                  title="Notifications"
                >
                  <FaBell className={`w-4 h-4 lg:w-5 lg:h-5 ${notificationUrgent ? 'animate-bounce' : ''}`} />
                  {notificationBadge && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
                      notificationUrgent ? "bg-red-500 animate-ping" : "bg-blue-500 text-white"
                    }`}>
                      {notificationUrgent ? "!" : "•"}
                    </span>
                  )}
                </button>
              )}

              <div className="flex items-center space-x-3 bg-blue-700/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-100 to-gray-200 rounded-full flex items-center justify-center text-slate-700 font-bold text-sm lg:text-base shadow-md">
                  {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-white">
                  <p className="text-sm font-medium">{userInfo?.username || "User"}</p>
                  <p className="text-xs text-gray-300">{getDisplayRole(userInfo?.role)}</p>
                </div>
                <button
                  onClick={onLogout || handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaSignOutAlt className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 bg-blue-700/80 hover:bg-blue-600/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-grey-800/95 backdrop-blur-md border-t border-gray-600 py-4 space-y-2">
            {showUserGuide && (
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => {
                  onUserGuideClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaBookOpen className="w-4 h-4 text-blue-300" />
                <span>User Guide</span>
              </button>
            )}
            
            {showNotifications && (
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => {
                  onNotificationClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaBell className="w-4 h-4 text-yellow-300" />
                <span>Notifications</span>
                {notificationBadge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {notificationUrgent ? "Urgent!" : "New"}
                  </span>
                )}
              </button>
            )}

            {/* Additional Mobile Menu Items */}
            {additionalMobileMenuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))
            }
            
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-700/60 rounded-lg mx-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-slate-700 font-bold text-base">
                {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-white">
                <span className="font-bold">{userInfo?.username || "User"}</span>
                <p className="text-sm text-gray-300">{getDisplayRole(userInfo?.role)}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout || handleLogout}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg text-base sm:text-lg"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default DashboardHeader;
