import React from 'react';

const SyncConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="text-2xl font-semibold dark:text-white">
          Sync nodes?
        </div>
        <p className="text-gray-800 dark:text-white mb-4">
          If you click "confirm", the current nodes synchronization will be started.<br />
          And shown links will be reset. <span className="font-semibold italic">Do you want to continue?</span>
        </p>
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncConfirmModal;
