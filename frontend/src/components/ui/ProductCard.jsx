import { Link } from "react-router-dom";
import Button from "./Button";
import defaultImg from "../../assets/default-product.jpg";
import { formatPrice } from "../../utils/formatPrice";
import { FaStar } from "react-icons/fa"; // NOWOŚĆ: Ikonka gwiazdki
import "../../styles/components/ui/product-card.scss";

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

  // TYMCZASOWE DANE DO TESTÓW (Później weźmiemy to z obiektu product, np. product.avg_rating)
  const mockedRating = 4.3;
  const mockedReviewsCount = 19;

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

        {/* NOWOŚĆ: Gwiazdki i ocena */}
        <div className="product-card__rating">
          <FaStar className="star-icon" />
          <span className="rating-score">{mockedRating}</span>
          <span className="rating-count">({mockedReviewsCount})</span>
        </div>

        <p className="product-card__price">
          od {formatPrice(product.price_brut)} zł
        </p>

        <Button
          variant="outline-slate-dark"
          className="product-card__btn"
          onClick={() => console.log(`Dodano do koszyka: ${product.name}`)}
        >
          Kup teraz
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
