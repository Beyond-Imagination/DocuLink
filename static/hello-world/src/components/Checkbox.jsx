import React, { useState } from 'react';

function CheckBox({ title, onChecked, tooltip }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    if (onChecked) {
        onChecked(title, checked);
    }
  };

  return (
    <div className='relative group'>
      <div className="flex items-center mb-4">
        <input 
          id={`${title}-checkbox`}
          type={'checkbox'}
          checked={isChecked}
          onChange={handleChange}
          className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2'
        />
        <label htmlFor="default-checkbox" className={`ms-2 text-sm font-medium capitalize ${isChecked ? 'text-yellow-300' : 'text-white'}`}>{title}</label>
      </div>
      {tooltip && (
          <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {tooltip}
          </span>
        )
      }
    </div>
  );
}

export default CheckBox;