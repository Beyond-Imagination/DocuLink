const PageNodeTooltip = ({ title, status, createdAt, authorName }) => {
  return (
    <div className="absolute bottom-0 right-0 bg-black/70 text-yellow-300 p-[1rem] rounded pointer-events-none z-[1000] text-start">
      <div className="w-[320px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50">
        <div className="items-start gap-3">
          <div className="flex">
            <div className="my-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" role="presentation"><path fill="#2684ff" fill-rule="evenodd" d="M3 0h18a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3m1 18c0 .556.446 1 .995 1h8.01c.54 0 .995-.448.995-1 0-.556-.446-1-.995-1h-8.01c-.54 0-.995.448-.995 1m0-4c0 .556.448 1 1 1h14c.555 0 1-.448 1-1 0-.556-.448-1-1-1H5c-.555 0-1 .448-1 1m0-4c0 .556.448 1 1 1h14c.555 0 1-.448 1-1 0-.556-.448-1-1-1H5c-.555 0-1 .448-1 1m0-4c0 .556.448 1 1 1h14c.555 0 1-.448 1-1 0-.556-.448-1-1-1H5c-.555 0-1 .448-1 1"></path></svg>
            </div>
            <div className="px-2 space-y-0">
              <div className="text-base font-medium text-gray-900 truncate w-[250px]">{title}</div>
              <div className="mt-1 text-xs text-gray-500">
                {authorName}
              </div>
            </div>
          </div>
          <div className="flex space-x-2 px-8">
            <div className="mt-1 text-xs text-gray-500">
              Status: {status}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Created: {createdAt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNodeTooltip;