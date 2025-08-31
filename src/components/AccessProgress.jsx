import React, { useState } from 'react';
import * as FaIcons from "react-icons/fa";

function AccessProgress({ allAccess, userAccess, clientInfo, loading = false }) {
  const [showAll, setShowAll] = useState(false);
  const completedCount = userAccess.length;
  const totalCount = allAccess.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  const displayedAccess = showAll ? allAccess : allAccess.slice(0, 8);
  const hasMore = allAccess.length > 8;

  if (loading) {
    return (
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
        
        {/* Header with Progress Summary */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FaIcons.FaChartLine className="text-blue-600 text-sm" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">
                Access Progress
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block border border-gray-200">
              {completedCount} of {totalCount} access permissions granted
            </p>
          </div>
          
          {/* Professional Progress Bar */}
          <div className="flex items-center gap-3 sm:gap-4 sm:ml-6 min-w-0 sm:min-w-fit">
            <div className="flex-1 sm:w-32 md:w-40 lg:w-48 bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-sm sm:text-base font-bold text-slate-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Access Items Grid */}
        <div className="relative">
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 ${
            !showAll && hasMore ? 'max-h-64 sm:max-h-80 lg:max-h-96 overflow-hidden' : ''
          }`}>
            {displayedAccess.map((access, index) => {
              const isAllotted = userAccess.includes(access.access_id);
              const displayName = (access.access_name === 'Entuity Access' || access.access_name === 'Application Access') && clientInfo?.application_name
                ? `${clientInfo.application_name} Access`
                : access.access_name;

              return (
                <div 
                  key={access.access_id} 
                  className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
                    isAllotted 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  
                  {/* Status Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 flex-shrink-0 transition-all duration-300 ${
                    isAllotted 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-gray-100 border-gray-400'
                  }`}>
                    {isAllotted ? (
                      <FaIcons.FaCheck className="text-green-600 text-sm" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  
                  {/* Access Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm sm:text-base truncate transition-colors duration-300 ${
                      isAllotted ? 'text-slate-800' : 'text-gray-600'
                    }`}>
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                        isAllotted ? 'text-green-700' : 'text-orange-600'
                      }`}>
                        {isAllotted ? 'Granted' : 'Pending'}
                      </p>
                      {isAllotted && (
                        <div className="flex items-center gap-1">
                         
                          
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {isAllotted && (
                    <div className="hidden sm:flex flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        Complete
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {hasMore && (
            <div className="relative z-20 mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-3 px-6 py-3 text-base font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-slate-600 hover:border-slate-700"
              >
                {showAll ? (
                  <>
                    <FaIcons.FaChevronUp className="w-4 h-4" />
                    <span>Show Less</span>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">↑</span>
                    </div>
                  </>
                ) : (
                  <>
                    <FaIcons.FaChevronDown className="w-4 h-4" />
                    <span>View All Access Items</span>
                    <div className="w-6 h-6 bg-white text-slate-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {allAccess.length - 8}
                    </div>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AccessProgress;
