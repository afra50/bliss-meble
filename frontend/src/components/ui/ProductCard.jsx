import { Link } from "react-router-dom";
import Button from "./Button";
import defaultImg from "../../assets/default-product.jpg";
import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/ui/product-card.scss";
import StarRating from "./StarRating";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductCard = ({ product, isNew = false }) => {
  const getImageUrl = (imagePath) => {
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  const imageUrl = product.main_image
    ? getImageUrl(product.main_image)
    : defaultImg;

  const productLink = `/sklep/${product.slug}`;

  // ZMIANA: Zczytujemy ocenę z obiektu produktu (nadamy ją w komponencie wyżej)
  const rating = product.mockRating || 0;
  const reviewsCount = product.mockReviewsCount || 0;

  return (
    <article className="product-card">
      <Link to={productLink} className="product-card__link">
        {isNew && (
          <div className="product-card__badge product-card__badge--new">
            Nowość
          </div>
        )}
        <div className="product-card__img">
          <img
            src={imageUrl}
            alt={product.name}
            onError={(e) => {
              e.target.src = defaultImg;
            }}
          />
          <div className="product-card__img-overlay">
            <span>Zobacz produkt</span>
          </div>
        </div>
      </Link>

      <div className="product-card__info">
        <h4>
          <Link to={productLink}>{product.name}</Link>
        </h4>

        {/* ZMIANA: Wyświetlamy sekcję ocen tylko, jeśli faktycznie istnieją jakieś opinie */}
        {reviewsCount > 0 ? (
          <StarRating rating={rating} count={reviewsCount} size="small" />
        ) : (
          <div className="product-card__rating" style={{ opacity: 0.5 }}>
            <span className="rating-count">Brak opinii</span>
          </div>
        )}

        <p className="product-card__price">
          od {formatPrice(product.price_brut)} zł
        </p>

        <Button
          to={productLink}
          variant="outline-slate-dark"
          className="product-card__btn"
        >
          Kup teraz
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
