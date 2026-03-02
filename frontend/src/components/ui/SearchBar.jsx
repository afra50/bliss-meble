import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { productApi } from "../../utils/api"; // Dostosuj ścieżkę do api.js
import "../../styles/components/ui/search-bar.scss";

const SearchBar = ({ className }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Implementacja debouncingu - zapytanie wyśle się 500ms po zakończeniu pisania
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        try {
          const response = await productApi.search(query);
          console.log("Wyniki wyszukiwania:", response.data);
          // Tutaj w przyszłości przekażemy wyniki do stanu/kontekstu
        } catch (error) {
          console.error("Błąd wyszukiwania:", error);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className={`search-bar ${className}`}>
      <input
        type="text"
        placeholder="Czego szukasz?"
        className="search-bar__input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="search-bar__icon">
        <FaSearch />
      </div>
    </div>
  );
};

export default SearchBar;
