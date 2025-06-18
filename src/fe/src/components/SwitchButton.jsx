import React from 'react';

const SwitchButton = ({ is3D, setIs3D }) => {
  const handleCheckboxChange = () => {
    setIs3D(!is3D)
  };

  return (
      <>
        <label className="themeSwitcherTwo relative inline-flex cursor-pointer select-none items-center">
          <input
              type="checkbox"
              checked={is3D}
              onChange={handleCheckboxChange}
              className="sr-only"
          />
          <span className={`label flex items-center text-sm font-medium ${is3D ? 'dark:text-white text-gray-600' : 'dark:text-yellow-300 text-purple-600'}`}>
            2D
          </span>
          <span className={`slider mx-4 flex h-8 w-[60px] items-center rounded-full p-1 duration-200 ${is3D ? 'dark:bg-[#212b36] bg-[#636a72]' : 'dark:bg-[#CCCCCE] bg-[#91969c]'}`}>
            <span className={`dot h-6 w-6 rounded-full bg-white duration-200 ${is3D ? 'translate-x-[28px]' : ''}`} />
          </span>
          <span className={`label flex items-center text-sm font-medium ${is3D ? 'dark:text-yellow-300 text-purple-600' : 'dark:text-white text-gray-600'}`}>
            3D
          </span>
        </label>
      </>
  );
};

export default SwitchButton;
