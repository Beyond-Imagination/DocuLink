import React, {useState} from "react";
import { BsMoon, BsSun } from "react-icons/bs"

function DarkmodeBtn() {
  const [dark, setDark] = useState(false);

  const darkModeHandler = () => {
    setDark(!dark);
    document.body.classList.toggle("dark");
  }

  return (
    <button 
      className="fixed bottom-8 right-5 bg-white w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-gray border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-105 transition-all
      dark:bg-gray-500 dark:border-gray-600"
      onClick={darkModeHandler}
    >
      {
        dark ? ( <BsSun /> ) : ( <BsMoon /> )
      }
    </button>
  )
}

export default DarkmodeBtn;