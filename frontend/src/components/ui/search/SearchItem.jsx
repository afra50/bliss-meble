import { Link } from "react-router-dom";
import "../../../styles/components/ui/search/search-item.scss";

const SearchItem = ({ product, onClick }) => {
  // Budujemy poprawny URL do zdjęcia (używając BASE_URL z Twojego api.js)
  const imageUrl = `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/products/${product.main_image}`;

  return (
    <Link
      to={`sklep/${product.slug}`}
      className="search-item"
      onClick={onClick}
    >
      <div className="search-item__image">
        <img src={imageUrl} alt={product.name} />
      </div>
      <div className="search-item__info">
        <p className="search-item__name">{product.name}</p>
        <p className="search-item__price">{product.price_brut} zł</p>
      </div>
    </Link>
  );
};

export default SearchItem;
