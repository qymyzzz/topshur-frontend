import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import "../css/LoadingModal.css";

const LoadingModal = ({message="Пожалуйста, подождите"}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleFocus = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        modalRef.current.focus();
      }
    };

    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="loading-modal-overlay" role="dialog" aria-modal="true">
      <div className="loading-modal" tabIndex="-1" ref={modalRef}>
        <pre>{message}</pre>
        <div className="loading-animation"></div>
      </div>
    </div>,
    document.body
  );
};

export default LoadingModal;
