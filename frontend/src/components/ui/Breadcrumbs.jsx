import { Link } from "react-router-dom";
import "../../styles/components/ui/breadcrumbs.scss";

// Przykładowe użycie:
// <Breadcrumbs paths={[{ label: "Sklep", to: "/sklep" }, { label: "Narożniki" }]} theme="light" />

const Breadcrumbs = ({ paths = [], theme = "dark" }) => {
  return (
    <nav className={`breadcrumbs breadcrumbs--${theme}`}>
      <Link to="/" className="breadcrumbs__link">
        Strona główna
      </Link>

      {paths.map((path, index) => {
        // Czy to ostatni element na liście?
        const isLast = index === paths.length - 1;

        return (
          <span key={index} className="breadcrumbs__item">
            <span className="breadcrumbs__separator">/</span>
            {isLast || !path.to ? (
              <span className="breadcrumbs__current">{path.label}</span>
            ) : (
              <Link to={path.to} className="breadcrumbs__link">
                {path.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
