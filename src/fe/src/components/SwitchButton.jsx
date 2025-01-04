import React from 'react'

const SwitchButton = ({is3D, setIs3D}) => {
    const handleCheckboxChange = () => {
        setIs3D(!is3D)
    }

    return (<>
        <label className='themeSwitcherTwo relative inline-flex cursor-pointer select-none items-center'>
            <input
                type='checkbox'
                checked={is3D}
                onChange={handleCheckboxChange}
                className='sr-only'
            />
            <span className={`label flex items-center text-sm font-medium ${is3D ? 'text-white' : 'text-yellow-300'}`}>
              2D
            </span>
            <span
                className={`slider mx-4 flex h-8 w-[60px] items-center rounded-full p-1 duration-200 ${is3D ? 'bg-[#212b36]' : 'bg-[#CCCCCE]'}`}
            >
                <span
                    className={`dot h-6 w-6 rounded-full bg-white duration-200 ${is3D ? 'translate-x-[28px]' : ''}`}
                ></span>
            </span>
            <span className={`label flex items-center text-sm font-medium ${is3D ? 'text-yellow-300' : 'text-white'}`}>
              3D
            </span>
        </label>
    </>)
}

export default SwitchButton
