import React, { useState, useEffect } from 'react';
import { BsMoon, BsSun } from 'react-icons/bs';

const DarkmodeBtn = ({isDarkMode, onChange}) => {
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('doculinkDarkmode') === 'true';
    setDark(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const darkModeHandler = () => {
    const newDarkMode = !dark;
    setDark(newDarkMode);
    onChange(newDarkMode);
    document.body.classList.toggle('dark');
    localStorage.setItem('doculinkDarkmode', newDarkMode);
  };

  return (
    <button
      className="fixed bottom-8 right-5 bg-white w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-gray border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-105 transition-all dark:bg-gray-500 dark:border-gray-600"
      onClick={darkModeHandler}
    >
      {dark ? <BsSun /> : <BsMoon />}
    </button>
  );
};

export default DarkmodeBtn;
