import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "../../styles/components/ui/star-rating.scss";

// params:
// rating (number): np. 4.3
// count (number): ilość opinii, np. 12
// size (string): "small" (lista produktów - jedna gwiazdka), "medium" (szczegóły góra), "large" (sekcja na dole)
const StarRating = ({ rating = 0, count = 0, size = "small" }) => {
  // Tryb "small" (np. na liście produktów) - pokazuje tylko 1 gwiazdkę i cyferki
  if (size === "small") {
    return (
      <div
        className={`star-rating star-rating--small ${count === 0 ? "star-rating--empty" : ""}`}
      >
        <FaStar className="star-icon full" />
        <span className="rating-score">{count > 0 ? rating : "Brak"}</span>
        <span className="rating-count">({count})</span>
      </div>
    );
  }

  // Tryb "medium" / "large" - rysujemy 5 gwiazdek (pełne, połówki, puste)
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star-icon full" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star-icon half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon empty" />);
      }
    }
    return stars;
  };

  return (
    <div className={`star-rating star-rating--${size}`}>
      <div className="stars-wrapper">{renderStars()}</div>
      {/* Dodatkowy tekst obok gwiazdek pokazujemy tylko jeśli nie podajemy z zewnątrz własnego (np w ProductInfo chcemy własny klikalny link) */}
      {size === "large" && count > 0 && (
        <span className="rating-score-text">
          {rating} ({count} opinii)
        </span>
      )}
    </div>
  );
};

export default StarRating;
