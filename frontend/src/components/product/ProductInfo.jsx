import { formatPrice } from "../../utils/formatPrice";
import { FaTruck, FaShieldAlt } from "react-icons/fa";
import "../../styles/components/product/product-info.scss";

const ProductInfo = ({ product, finalPrice, children }) => {
  return (
    <section className="product-info">
      <h1 className="product-info__title">{product.name}</h1>

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
