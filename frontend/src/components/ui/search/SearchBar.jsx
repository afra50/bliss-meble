import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../../utils/api";
import SearchPreview from "./SearchPreview";
import "../../../styles/components/ui/search/search-bar.scss";

const SearchBar = ({ className }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Sprawdzamy czy to wersja mobilna (po klasie z propsów)
  const isMobile = className?.includes("header__search-mobile");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2 && !isMobile) {
        try {
          const response = await productApi.search(query);
          setResults(response.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Błąd wyszukiwania:", error);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isMobile]);

  // Zamykanie dropdownu po kliknięciu poza wyszukiwarkę
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchTrigger = () => {
    if (query.trim()) {
      navigate(`/szukaj?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchTrigger();
  };

  return (
    <div className={`search-bar ${className}`} ref={searchRef}>
      <div className="search-bar__field">
        <input
          type="text"
          placeholder="Czego szukasz?"
          className="search-bar__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && !isMobile && setIsOpen(true)}
        />
        <div className="search-bar__icon" onClick={handleSearchTrigger}>
          <FaSearch />
        </div>
      </div>

      {isOpen && !isMobile && (
        <SearchPreview
          results={results}
          query={query}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
