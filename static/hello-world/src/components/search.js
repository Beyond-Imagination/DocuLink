import React from 'react';

function Search({ searchWord, setSearchWord, handleSearch, handleSearchReset }) {
  return (
    <div className='absolute z-10 right-[1rem] top-[1rem] w-[20rem]'>
      <form class="max-w-md mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >   
        <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <div 
            className='absolute items-center end-0 inset-y-0 right-[6rem] flex cursor-pointer'
            onClick={handleSearchReset} 
          >
            <svg width="20px" height="20px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fill-rule="evenodd" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" transform="matrix(0 1 1 0 2.5 2.5)">
              <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"/>
              <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"/>
              </g>
            </svg>
          </div>
          <input 
            type="search" 
            id="default-search" 
            class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search contents..." 
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            autoComplete='off'
            required />
          <button 
            type="submit" 
            class="text-white w-[5rem] absolute end-2.5 bottom-2.5 bg-[#0C66E4] hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleSearch}
            >Search</button>
        </div>
      </form>
    </div>
  );
}

export default Search;