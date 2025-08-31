import React from 'react';

function ManagementSection({ title, items = [] }) {
  return (
    <div className="lg:col-span-1">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      <div className="space-y-3 sm:space-y-4">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="group cursor-pointer bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-3 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-blue-50"
            onClick={item.onClick}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.iconBgColor || 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className={`${item.iconColor || 'text-blue-600'} text-sm sm:text-base`}>
                  {item.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{item.description}</p>
              </div>
              {item.badge && (
                <span className={`${item.badgeColor || 'bg-blue-100 text-blue-800'} text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0`}>
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className={`text-lg sm:text-2xl font-bold ${item.countColor || 'text-blue-600'} flex-shrink-0`}>
                  {item.count}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManagementSection;
