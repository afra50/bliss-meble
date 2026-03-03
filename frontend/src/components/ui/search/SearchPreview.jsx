import SearchItem from "./SearchItem";
import { Link } from "react-router-dom";
import "../../../styles/components/ui/search/search-preview.scss";

const SearchPreview = ({ results, query, onClose }) => {
  if (!results || results.length === 0) return null;

  const MAX_RESULTS = 1;
  const displayResults = results.slice(0, MAX_RESULTS);
  const hasMore = results.length > MAX_RESULTS;

  return (
    <div className="search-preview">
      <div className="search-preview__list">
        {displayResults.map((product) => (
          <SearchItem key={product.id} product={product} onClick={onClose} />
        ))}
      </div>

      {hasMore && (
        <Link
          to={`/szukaj?q=${query}`}
          className="search-preview__more"
          onClick={onClose}
        >
          Pokaż więcej
        </Link>
      )}
    </div>
  );
};

export default SearchPreview;
