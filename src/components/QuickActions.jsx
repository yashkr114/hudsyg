import React from 'react';

function QuickActions({ title = "Quick Actions", actions = [] }) {
  return (
    <div className="mt-6 sm:mt-8">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((action, index) => (
            <button 
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 sm:p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 min-h-[80px] sm:min-h-[100px]"
            >
              <div className={`${action.iconColor || 'text-blue-600'} text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 flex items-center justify-center`}>
                {action.icon}
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
