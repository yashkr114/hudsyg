import React from 'react';

function StatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.valueColor || 'text-slate-800'}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${stat.iconBgColor || 'bg-slate-100'} rounded-lg flex items-center justify-center self-end sm:self-auto shadow-sm`}>
              <div className={`${stat.iconColor || 'text-slate-600'} text-sm sm:text-base lg:text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-500">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
