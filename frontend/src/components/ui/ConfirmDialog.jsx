import React from "react";
import { AlertTriangle, X, Loader2, Info } from "lucide-react"; // Dodano Loader2 i Info
import "../../styles/components/ui/confirm-dialog.scss";

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Potwierdź", // Domyślny tekst
  cancelText = "Anuluj", // Domyślny tekst
  isLoading = false, // Flaga ładowania
  variant = "danger", // "danger" (czerwony) lub "primary" (czarny)
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <button
          className="confirm-dialog__close"
          onClick={onCancel}
          disabled={isLoading} // Blokada zamknięcia w trakcie ładowania
        >
          <X size={20} />
        </button>

        <div className={`confirm-dialog__icon ${variant}`}>
          {variant === "danger" ? (
            <AlertTriangle size={32} />
          ) : (
            <Info size={32} />
          )}
        </div>

        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn-confirm btn-confirm--${variant}`}
            onClick={onConfirm}
            disabled={isLoading} // Blokada przycisku
          >
            {isLoading ? <Loader2 size={18} className="spinner" /> : null}
            <span>{isLoading ? "Przetwarzanie..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
