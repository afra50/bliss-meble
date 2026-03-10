import { formatPrice } from "../../utils/formatPrice";
import { FaTruck, FaShieldAlt } from "react-icons/fa";
import StarRating from "../ui/StarRating";
import "../../styles/components/product/product-info.scss";

// ZMIANA: Zamiast finalPrice przyjmujemy obiekt pricing
const ProductInfo = ({ product, pricing, rating, reviewsCount, children }) => {
  return (
    <section className="product-info">
      <h1 className="product-info__title">{product.name}</h1>

      <div className="product-info__rating">
        <StarRating rating={rating} size="medium" />
        <span className="score">{rating}</span>
        <a href="#opinie" className="count">
          Czytaj opinie ({reviewsCount})
        </a>
      </div>

      {/* ZMIANA: Nowy układ ceny obsługujący promocje */}
      <div className="product-info__price-container">
        {pricing?.isPromo ? (
          <>
            <div className="product-info__price-old-wrap">
              <span className="price-old">
                {formatPrice(pricing.regular)} zł
              </span>
              <span className="price-save-badge">
                Oszczędzasz: {formatPrice(pricing.savings)} zł
              </span>
            </div>
            <p
              className="product-info__price product-info__price--promo"
              key={pricing.current}
            >
              {formatPrice(pricing.current)} zł
            </p>
            <div className="product-info__omnibus">
              Najniższa cena z 30 dni przed obniżką:{" "}
              <strong>{formatPrice(pricing.omnibusPrice)} zł</strong>
            </div>
          </>
        ) : (
          <p className="product-info__price" key={pricing?.current}>
            {formatPrice(pricing?.current)} zł
          </p>
        )}
      </div>

      <p className="product-info__short-desc">{product.short_description}</p>

      {children}

      <div className="product-trust">
        <div className="trust-item">
          <FaTruck /> <span>Darmowa dostawa od 3000 zł</span>
        </div>
        <div className="trust-item">
          <FaShieldAlt /> <span>2 lata gwarancji producenta</span>
        </div>
      </div>

      <div className="product-description">
        <h3>Opis produktu</h3>
        <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>
    </section>
  );
};

export default ProductInfo;
