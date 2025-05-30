import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const JobDetailsModal = ({ isOpen, onClose, jobDetails }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Job Details</h2>
        <div className="mb-4">
          <p className="mb-2"><strong>Title:</strong> {jobDetails.title}</p>
          <p className="mb-2"><strong>Company:</strong> {jobDetails.company}</p>
          <p className="mb-2"><strong>Description:</strong> {jobDetails.description}</p>
          <p className="mb-2"><strong>Location:</strong> {jobDetails.location}</p>
          <p className="mb-2"><strong>Salary:</strong> {jobDetails.salary}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default JobDetailsModal;

