import React from 'react';

function CheckBox({ title, onChecked, tooltip, color, checked }) {
  const handleChange = (e) => {
    const newChecked = e.target.checked;
    if (onChecked) {
        onChecked(title, newChecked);
    }
  };

  return (
    <div className='relative group'>
      <div className="flex items-center mb-4">
        <input 
          id={`${title}-checkbox`}
          type={'checkbox'}
          checked={checked}
          onChange={handleChange}
          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2'
        />
        <label htmlFor={`${title}-checkbox`} className={`px-2 text-sm font-medium capitalize ${checked ? 'dark:text-yellow-300 text-purple-600' : 'dark:text-white text-gray-600'}`}>{title}</label>
        <div className='w-4 h-4 rounded-full border border-white'
          style={{
            backgroundColor: color
          }}
        ></div>
      </div>
      {tooltip && (
          <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-2 py-1 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {tooltip}
          </span>
        )
      }
    </div>
  );
}

export default CheckBox;