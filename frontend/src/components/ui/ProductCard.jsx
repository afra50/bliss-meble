import { Link } from "react-router-dom";
import Button from "./Button";
// 1. IMPORTUJEMY DOMYŚLNY OBRAZEK
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/components/ui/product-card.scss";
import { formatPrice } from "../../utils/formatPrice";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductCard = ({ product, isNew = false }) => {
  const getImageUrl = (imagePath) => {
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  // 2. LOGIKA WYBORU: Jeśli brak main_image, używamy defaultImg
  const imageUrl = product.main_image
    ? getImageUrl(product.main_image)
    : defaultImg;

  const productLink = `/produkt/${product.slug || product.id}`;

  return (
    <article className="product-card">
      <Link to={productLink} className="product-card__link">
        {isNew && (
          <div className="product-card__badge product-card__badge--new">
            Nowość
          </div>
        )}
        <div className="product-card__img">
          {/* 3. DODAJEMY onError DLA ZABEZPIECZENIA PRZED BŁĘDNYMI ŚCIEŻKAMI */}
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
