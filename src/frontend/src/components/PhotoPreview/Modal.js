import React from "react";
import "./Modal.css";

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null; // Don't render the modal if it's not visible
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
