import React, { useState } from 'react';

function CheckBox({ title, onChecked }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    if (onChecked) onChecked(checked);
  };

  return (
    <div className="flex items-center mb-4">
      <input 
        id={`${title}-checkbox`}
        type={'checkbox'}
        checked={isChecked}
        onChange={handleChange}
        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2'
      />
      <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-white">{title}</label>
    </div>
  );
}

export default CheckBox;