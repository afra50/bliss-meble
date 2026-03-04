import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react"; // NOWOŚĆ: Ikonka ładowania
import "../../styles/components/ui/button.scss";

const Button = ({
  children,
  to,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false, // NOWOŚĆ: Prop blokujący
  isLoading = false, // NOWOŚĆ: Prop włączający spinner
}) => {
  // Dodajemy klasę '--disabled', gdy przycisk ładuje lub jest zablokowany
  const btnClass = `btn btn--${variant} ${disabled || isLoading ? "btn--disabled" : ""} ${className}`;

  if (to && !disabled && !isLoading) {
    return (
      <Link to={to} className={btnClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={btnClass}
      onClick={onClick}
      disabled={disabled || isLoading} // NAJWAŻNIEJSZE: natywna blokada HTML
    >
      {/* Jeśli się ładuje, pokaż spinner obok tekstu */}
      {isLoading ? (
        <>
          <Loader2 className="btn__spinner" size={18} />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
