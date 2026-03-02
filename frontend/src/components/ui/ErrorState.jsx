import Button from "./Button";
import { FaExclamationTriangle } from "react-icons/fa";
import "../../styles/components/ui/error-state.scss";

const ErrorState = ({
  message = "Nie udało się załadować danych.",
  onRetry,
}) => {
  return (
    <div className="error-state">
      <div className="error-state__content">
        <FaExclamationTriangle className="error-state__icon" />
        <h3 className="error-state__title">Ups! Coś poszło nie tak</h3>
        <p className="error-state__message">{message}</p>

        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="error-state__btn"
          >
            Spróbuj ponownie
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
