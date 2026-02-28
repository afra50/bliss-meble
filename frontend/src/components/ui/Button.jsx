import { Link } from "react-router-dom";
import "../../styles/components/ui/button.scss";

const Button = ({
  children,
  to,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}) => {
  // Budujemy ostateczną klasę, np. "btn btn--primary"
  const btnClass = `btn btn--${variant} ${className}`;

  // Jeśli przekazaliśmy 'to', renderujemy jako Link (nawigacja)
  if (to) {
    return (
      <Link to={to} className={btnClass} onClick={onClick}>
        {children}
      </Link>
    );
  }

  // W przeciwnym razie renderujemy jako zwykły przycisk (np. w formularzu lub "dodaj do koszyka")
  return (
    <button type={type} className={btnClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
