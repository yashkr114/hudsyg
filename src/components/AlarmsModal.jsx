import React, { useEffect, useState } from 'react';
import * as FaIcons from "react-icons/fa";

function AlarmsModal({ isOpen, onClose, alarms, loading, userAccess }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');

  // Get user role from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      setUserRole('');
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "No deadline";
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isUrgent = (dateStr) => {
    if (!dateStr) return false;
    const daysLeft = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 3;
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const daysLeft = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  // Filter alarms based on search term and user role
  const filteredAlarms = userRole === 'admin' 
    ? alarms.filter(alarm => 
        alarm.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.gid_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.access_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : alarms.filter(alarm => {
        // For non-admin users, only show their own alarms
        const matchesSearch = alarm.access_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const hasAccess = userAccess?.some(access => access.access_id === alarm.access_id);
        return matchesSearch && !hasAccess;
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-4 sm:p-6 relative max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaIcons.FaBell className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {userRole === 'admin' ? 'All Employee Alarms' : 'Your Alarms'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {userRole === 'admin' 
                  ? 'Access request deadlines for all employees' 
                  : 'Your pending access request deadlines'
                }
              </p>
            </div>
          </div>
          <button
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            onClick={onClose}
          >
            <FaIcons.FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <FaIcons.FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={userRole === 'admin' 
                ? "Search by employee name, GID, or access type..." 
                : "Search by access type..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8 sm:py-12">
              <div className="animate-spin mx-auto w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base">Loading alarms...</p>
            </div>
          ) : filteredAlarms.length === 0 ? (
            <div className="text-center text-gray-500 py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FaIcons.FaCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
              <p className="font-medium text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">
                {searchTerm ? 'No alarms found' : 'All Clear!'}
              </p>
              <p className="text-sm sm:text-base">
                {searchTerm 
                  ? 'No alarms match your search criteria.' 
                  : userRole === 'admin' 
                    ? 'No pending access deadlines found.' 
                    : 'No pending access requests for you.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    {userRole === 'admin' && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Employee</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">GID</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Access Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deadline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlarms.map((alarm, index) => {
                    const deadlineStr = formatDate(alarm.deadline_date);
                    const urgent = isUrgent(alarm.deadline_date);
                    const daysLeft = getDaysLeft(alarm.deadline_date);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        {userRole === 'admin' && (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-900">{alarm.username}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{alarm.gid_no}</td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-700">{alarm.access_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{deadlineStr}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            daysLeft < 0 ? 'bg-red-100 text-red-800' :
                            urgent ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysLeft < 0 ? (
                              <>
                                <FaIcons.FaExclamationTriangle />
                                Overdue
                              </>
                            ) : urgent ? (
                              <>
                                <FaIcons.FaClock />
                                {daysLeft} days left
                              </>
                            ) : (
                              <>
                                <FaIcons.FaCheckCircle />
                                {daysLeft} days left
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total Alarms: {filteredAlarms.length}
          </span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlarmsModal;
