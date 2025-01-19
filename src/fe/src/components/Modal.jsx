const Modal = ({content, showModal, setShowModal}) => {
    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition ${showModal ? 'flex' : 'hidden'}`}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
                <p className="text-white">
                    {content}
                </p>
                <button
                    onClick={() => setShowModal(false)}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default Modal;