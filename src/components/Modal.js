import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
// import './Modal.css';
import "../css/Modal.css";

const Modal = ({ message, onClose, onConfirm, confirmText, cancelText }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleFocus = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        modalRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" tabIndex="-1" ref={modalRef}>
        <pre>{message}</pre>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="btnConfirm">{confirmText}</button>
          <button onClick={onClose} className="btnCancel">{cancelText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
