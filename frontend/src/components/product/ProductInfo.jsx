import { formatPrice } from "../../utils/formatPrice";
import { FaTruck, FaShieldAlt, FaStar, FaStarHalfAlt } from "react-icons/fa"; // DODAŁEM GWIAZDKI
import "../../styles/components/product/product-info.scss";

const ProductInfo = ({ product, finalPrice, children }) => {
  // TYMCZASOWE DANE DO TESTÓW
  const mockedRating = 4.8;
  const mockedReviewsCount = 12;

  return (
    <section className="product-info">
      <h1 className="product-info__title">{product.name}</h1>

      {/* NOWOŚĆ: Sekcja ocen pod tytułem */}
      <div className="product-info__rating">
        <div className="stars">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStarHalfAlt />
        </div>
        <span className="score">{mockedRating}</span>
        {/* Link, który w przyszłości przewinie stronę do sekcji #opinie */}
        <a href="#opinie" className="count">
          Czytaj opinie ({mockedReviewsCount})
        </a>
      </div>

      <div className="product-info__price-wrapper">
        <p className="product-info__price" key={finalPrice}>
          {formatPrice(finalPrice)} zł
        </p>
      </div>

      <p className="product-info__short-desc">{product.short_description}</p>

      {/* Tutaj wpadną opcje (ProductOptions) i akcje (Koszyk/Licznik) */}
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
