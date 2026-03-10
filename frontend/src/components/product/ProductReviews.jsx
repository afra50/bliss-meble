import { FaStar, FaCheckCircle } from "react-icons/fa";
import Button from "../ui/Button";
import StarRating from "../ui/StarRating";
import "../../styles/components/product/product-reviews.scss";

// ZMIANA: Wszystkie dane wpadają przez propsy z góry!
const ProductReviews = ({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
}) => {
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
            <StarRating rating={averageRating} size="large" />
            <span className="reviews-count">
              Na podstawie {totalReviews} opinii
            </span>
          </div>

          <div className="reviews-summary__bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage =
                totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

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
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-card__header">
                  <div className="author-info">
                    <span className="author-name">{review.author}</span>
                    <span className="verified-badge">Zweryfikowany zakup</span>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <div className="review-card__stars">
                  <StarRating rating={review.rating} size="medium" />
                </div>
                <p className="review-card__content">{review.content}</p>
              </article>
            ))
          ) : (
            <p>Ten produkt nie ma jeszcze opinii.</p>
          )}

          {reviews.length > 0 && (
            <div className="reviews-list__actions">
              <Button variant="outline-slate" className="load-more-btn">
                Pokaż więcej opinii
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
