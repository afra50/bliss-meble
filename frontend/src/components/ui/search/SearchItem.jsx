import { Link } from "react-router-dom";
// 1. Importujemy domyślny obrazek (ścieżka relatywna do komponentu)
import defaultImg from "../../../assets/default-product.jpg";
import "../../../styles/components/ui/search/search-item.scss";

const SearchItem = ({ product, onClick }) => {
  // ZMIANA: Czysta funkcja do generowania linku ze zmiennej .env
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/products/${imagePath}`;
  };

  const imageUrl = getImageUrl(product.main_image);

  return (
    <Link
      to={`sklep/${product.slug}`}
      className="search-item"
      onClick={onClick}
    >
      <div className="search-item__image">
        {/* 3. Dodajemy obsługę błędu (onError), jeśli plik fizycznie nie istnieje na serwerze */}
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            e.target.src = defaultImg;
          }}
        />
      </div>
      <div className="search-item__info">
        <p className="search-item__name">{product.name}</p>
        <p className="search-item__price">{product.price_brut} zł</p>
      </div>
    </Link>
  );
};

export default SearchItem;
