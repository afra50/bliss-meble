import { formatPrice } from "../../utils/formatPrice";
import { FaTruck, FaShieldAlt } from "react-icons/fa";
import StarRating from "../ui/StarRating";
import "../../styles/components/product/product-info.scss";

// ZMIANA: Dodajemy rating i reviewsCount do propsów
const ProductInfo = ({
  product,
  finalPrice,
  rating,
  reviewsCount,
  children,
}) => {
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

      <div className="product-info__price-wrapper">
        <p className="product-info__price" key={finalPrice}>
          {formatPrice(finalPrice)} zł
        </p>
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
