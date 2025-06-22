const Modal = ({ content, showModal, setShowModal }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
        <p className="dark:text-white">{content}</p>
        <button className="mt-4 px-4 py-2 text-gray-600 dark:bg-gray-500 dark:text-white rounded hover:dark:bg-gray-600 hover:bg-gray-300  transition" onClick={() => setShowModal(false)}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
