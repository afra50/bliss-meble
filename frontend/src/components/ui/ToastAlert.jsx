import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import "../../styles/components/ui/toast-alert.scss";

const ToastAlert = ({ isOpen, message, type = "success", onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Znika po 5 sekundach
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`toast-alert toast-alert--${type}`}>
      <div className="toast-alert__icon">
        {type === "success" ? <CheckCircle size={24} /> : <XCircle size={24} />}
      </div>
      <p className="toast-alert__message">{message}</p>
      <button className="toast-alert__close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default ToastAlert;
