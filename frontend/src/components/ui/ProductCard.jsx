import { Link } from "react-router-dom";
import Button from "./Button";
import "../../styles/components/ui/product-card.scss";
import { formatPrice } from "../../utils/formatPrice";

// Pomocnicza stała do budowania ścieżek z bazy
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductCard = ({ product, isNew = false }) => {
  // Czysta funkcja do zdjęć z bazy
  const getImageUrl = (imagePath) => {
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  // Używamy struktury dokładnie takiej, jaka jest w bazie danych
  const imageUrl = getImageUrl(product.main_image);
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
          <img src={imageUrl} alt={product.name} />
          <div className="product-card__img-overlay">
            <span>Zobacz produkt</span>
          </div>
        </div>
      </Link>

      <div className="product-card__info">
        <h4>
          <Link to={productLink}>{product.name}</Link>
        </h4>

        {/* Po prostu formatujemy pole price_brut, dokładnie jak w Bestsellerze */}
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
