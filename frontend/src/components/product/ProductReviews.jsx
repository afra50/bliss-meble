import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaCheckCircle,
} from "react-icons/fa";
import Button from "../ui/Button";
import "../../styles/components/product/product-reviews.scss";

// TYMCZASOWE DANE (Mockup) - później przyjdą z propsów jako `product.reviews`
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Katarzyna W.",
    date: "12 Marzec 2026",
    rating: 5,
    content:
      "Łóżko jest przepiękne i bardzo solidnie wykonane. Materiał (welur) w rzeczywistości wygląda jeszcze lepiej niż na zdjęciach. Zdecydowanie polecam ten sklep!",
  },
  {
    id: 2,
    author: "Michał P.",
    date: "05 Luty 2026",
    rating: 4,
    content:
      "Bardzo wygodny materac. Jedyna uwaga to czas dostawy, który wydłużył się o 2 dni, ale kontakt ze sklepem był wzorowy. Sam produkt bez zarzutu.",
  },
  {
    id: 3,
    author: "Anna K.",
    date: "28 Styczeń 2026",
    rating: 5,
    content:
      "Świetny stosunek jakości do ceny. Montaż był całkiem prosty, a łóżko nie skrzypi i jest bardzo stabilne.",
  },
];

const ProductReviews = ({ productId }) => {
  // W przyszłości te wartości wyliczymy na podstawie zaciągniętych opinii z bazy
  const averageRating = 4.8;
  const totalReviews = 12;
  const ratingDistribution = {
    5: 9,
    4: 2,
    3: 1,
    2: 0,
    1: 0,
  };

  // Pomocnicza funkcja do rysowania gwiazdek (pełnych i pustych)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="star-icon full" />);
      } else {
        stars.push(<FaRegStar key={i} className="star-icon empty" />);
      }
    }
    return stars;
  };

  return (
    <section className="product-reviews" id="opinie">
      <div className="product-reviews__header">
        <h2>Opinie klientów</h2>
        <p className="trust-info">
          <FaCheckCircle className="trust-info__icon" />
          Opinie mogą dodawać tylko klienci, którzy otrzymali od nas dedykowany
          link po zrealizowaniu zamówienia.
        </p>
      </div>

      <div className="product-reviews__grid">
        {/* LEWA STRONA: PODSUMOWANIE OCEN */}
        <div className="reviews-summary">
          <div className="reviews-summary__score">
            <span className="big-number">{averageRating}</span>
            <div className="stars-wrapper">
              <FaStar className="star-icon full" />
              <FaStar className="star-icon full" />
              <FaStar className="star-icon full" />
              <FaStar className="star-icon full" />
              <FaStarHalfAlt className="star-icon full" />
            </div>
            <span className="reviews-count">
              Na podstawie {totalReviews} opinii
            </span>
          </div>

          <div className="reviews-summary__bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star];
              const percentage = Math.round((count / totalReviews) * 100) || 0;

              return (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">
                    {star} <FaStar className="star-icon" />
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="count-label">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRAWA STRONA: LISTA OPINII */}
        <div className="reviews-list">
          {MOCK_REVIEWS.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-card__header">
                <div className="author-info">
                  <span className="author-name">{review.author}</span>
                  <span className="verified-badge">Zweryfikowany zakup</span>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <div className="review-card__stars">
                {renderStars(review.rating)}
              </div>
              <p className="review-card__content">{review.content}</p>
            </article>
          ))}

          <div className="reviews-list__actions">
            <Button variant="outline-slate" className="load-more-btn">
              Pokaż więcej opinii
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
