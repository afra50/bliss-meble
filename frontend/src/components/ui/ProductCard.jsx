import { Link } from "react-router-dom";
import Button from "./Button";
import defaultImg from "../../assets/default-product.jpg";
import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/ui/product-card.scss";
import StarRating from "./StarRating";

// ZMIANA: Usunięto stary BACKEND_URL z replace("/api", "")

const ProductCard = ({ product, isNew = false }) => {
  // ZMIANA: Nowa funkcja generująca pełny adres URL zdjęcia
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/products/${imagePath}`;
  };

  const imageUrl = product.main_image
    ? getImageUrl(product.main_image)
    : defaultImg;

  const productLink = `/sklep/${product.slug}`;

  // Wywalamy mockRating i mockReviewsCount
  const rating = Number(product.average_rating) || 0;
  const reviewsCount = Number(product.reviews_count) || 0;

  // Sprawdzamy czy produkt jest w promocji
  const isPromo =
    product.promotional_price && parseFloat(product.promotional_price) > 0;

  return (
    <article className="product-card">
      <Link to={productLink} className="product-card__link">
        {/* Nowy kontener na plakietki (może ich być kilka) */}
        <div className="product-card__badges">
          {isPromo && (
            <div className="product-card__badge product-card__badge--promo">
              Promocja
            </div>
          )}
          {isNew && (
            <div className="product-card__badge product-card__badge--new">
              Nowość
            </div>
          )}
        </div>

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

        <StarRating rating={rating} count={reviewsCount} size="small" />

        {/* Widok ceny wspierający promocję */}
        <div className="product-card__price-wrapper">
          {isPromo ? (
            <>
              <span className="price-old">
                {formatPrice(product.price_brut)} zł
              </span>
              <span className="price-current promo">
                od {formatPrice(product.promotional_price)} zł
              </span>
            </>
          ) : (
            <span className="price-current">
              od {formatPrice(product.price_brut)} zł
            </span>
          )}
        </div>

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
