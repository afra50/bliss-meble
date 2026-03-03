import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation, Navigate } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import NotFound from "./NotFound";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import SortSelect from "../components/ui/SortSelect";
import Pagination from "../components/ui/Pagination"; // IMPORT PAGINACJI
import { productApi } from "../utils/api";
import { getPluralProductForm } from "../utils/grammar";
import "../styles/pages/products.scss";

const validCategories = {
  zestawy: [],
  "kolekcja-snu": ["materace", "łóżka-kontynentalne", "łóżka-tapicerowane"],
  "strefa-komfortu": ["narożniki", "narożniki-u", "sofy", "fotele"],
  dodatki: ["kołdry", "poduszki", "inne-akcesoria"],
};

const categoryNames = {
  zestawy: "Zestawy",
  "kolekcja-snu": "Kolekcja SNU",
  "strefa-komfortu": "Strefa KOMFORTU",
  dodatki: "Dodatki",
  materace: "Materace",
  "łóżka-kontynentalne": "Łóżka kontynentalne",
  "łóżka-tapicerowane": "Łóżka tapicerowane",
  narożniki: "Narożniki",
  "narożniki-u": "Narożniki U",
  sofy: "Sofy",
  fotele: "Fotele",
  kołdry: "Kołdry",
  poduszki: "Poduszki",
  "inne-akcesoria": "Inne akcesoria",
};

// ILE PRODUKTÓW NA STRONĘ? (Możesz tu zmienić np. na 9 lub 12)
const ITEMS_PER_PAGE = 9;

const Products = () => {
  const category = useParams().category
    ? decodeURI(useParams().category)
    : undefined;
  const subcategory = useParams().subcategory
    ? decodeURI(useParams().subcategory)
    : undefined;
  const location = useLocation();

  const isAllProducts = location.pathname === "/sklep";
  const isSearch = location.pathname === "/szukaj";

  // STANY DLA DANYCH Z API I SORTOWANIA
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  // NOWE STANY DO PAGINACJI
  const [currentPage, setCurrentPage] = useState(1);

  // FUNKCJA SPRAWDZAJĄCA CZY PRODUKT JEST NOWOŚCIĄ (mniej niż 30 dni)
  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (category) params.category = category;
      if (subcategory) params.subcategory = subcategory;

      const response = await productApi.getAll(params);
      setProducts(response.data);
    } catch (err) {
      console.error("Błąd pobierania:", err);
      setError("Wystąpił błąd podczas ładowania produktów.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // ZMIANA: Reset sortowania i strony na 1 po zmianie kategorii
    setSortOption("default");
    setCurrentPage(1);
  }, [category, subcategory]);

  // LOGIKA SORTOWANIA
  const sortedProducts = useMemo(() => {
    let sorted = [...products];

    switch (sortOption) {
      case "price_asc":
        sorted.sort((a, b) => Number(a.price_brut) - Number(b.price_brut));
        break;
      case "price_desc":
        sorted.sort((a, b) => Number(b.price_brut) - Number(a.price_brut));
        break;
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    return sorted;
  }, [products, sortOption]);

  // LOGIKA PAGINACJI (Przecinanie posortowanej tablicy na fragmenty)
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
    setCurrentPage(1); // Przy zmianie sortowania też wracamy na 1. stronę!
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Przewija łagodnie do góry
  };

  if (!isAllProducts && !isSearch && category) {
    if (!validCategories[category]) {
      return <NotFound />;
    }
    if (subcategory && !validCategories[category].includes(subcategory)) {
      return <NotFound />;
    }
  }

  const formatName = (slug) => categoryNames[slug] || slug;

  let pageTitle = "Wszystkie produkty";
  if (isSearch) pageTitle = "Wyniki wyszukiwania";
  if (category && !subcategory) pageTitle = formatName(category);
  if (subcategory) pageTitle = formatName(subcategory);

  const buildBreadcrumbPaths = () => {
    const paths = [];
    if (isSearch) {
      paths.push({ label: "Szukaj" });
    } else if (isAllProducts) {
      paths.push({ label: "Sklep" });
    } else {
      paths.push({ label: "Sklep", to: "/sklep" });
      if (category) {
        paths.push({
          label: formatName(category),
          to: subcategory ? `/${category}` : null,
        });
      }
      if (subcategory) {
        paths.push({ label: formatName(subcategory) });
      }
    }
    return paths;
  };

  return (
    <main className="products-page">
      <section className="products-page__header">
        <div className="products-page__container">
          <Breadcrumbs paths={buildBreadcrumbPaths()} theme="light" />

          <h1 className="products-page__title">{pageTitle}</h1>
        </div>
      </section>

      <section className="products-page__content">
        <div className="products-page__container products-page__layout">
          <aside className="products-page__sidebar">
            <div className="filter-group">
              <h3>Kategorie</h3>
              <div className="filter-accordion">
                <div className="filter-accordion-item">
                  <Link to="/zestawy" className="filter-accordion-link">
                    Zestawy
                  </Link>
                </div>

                <details
                  className="filter-accordion-item"
                  open={category === "kolekcja-snu"}
                >
                  <summary>Kolekcja SNU</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/kolekcja-snu">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/materace">Materace</Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/łóżka-kontynentalne">
                        Łóżka kontynentalne
                      </Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/łóżka-tapicerowane">
                        Łóżka tapicerowane
                      </Link>
                    </li>
                  </ul>
                </details>

                <details
                  className="filter-accordion-item"
                  open={category === "strefa-komfortu"}
                >
                  <summary>Strefa KOMFORTU</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/strefa-komfortu">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/narożniki">Narożniki</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/narożniki-u">Narożniki U</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/sofy">Sofy</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/fotele">Fotele</Link>
                    </li>
                  </ul>
                </details>

                <details
                  className="filter-accordion-item"
                  open={category === "dodatki"}
                >
                  <summary>Dodatki</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/dodatki">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/kołdry">Kołdry</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/poduszki">Poduszki</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/inne-akcesoria">Inne akcesoria</Link>
                    </li>
                  </ul>
                </details>
              </div>
            </div>

            <div className="filter-group">
              <h3>Filtruj</h3>

              <div className="filter-subgroup">
                <h4>Cena</h4>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price1" />{" "}
                  <label htmlFor="price1">Poniżej 1000 zł</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price2" />{" "}
                  <label htmlFor="price2">1000 zł - 3000 zł</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price3" />{" "}
                  <label htmlFor="price3">Powyżej 3000 zł</label>
                </div>
              </div>

              <div className="filter-subgroup">
                <h4>Materiał</h4>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat1" />{" "}
                  <label htmlFor="mat1">Welur</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat2" />{" "}
                  <label htmlFor="mat2">Boucle</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat3" />{" "}
                  <label htmlFor="mat3">Tkanina strukturalna</label>
                </div>
              </div>

              <div className="filter-subgroup">
                <h4>Kolor</h4>
                <div className="color-swatches">
                  <button
                    className="color-swatch color-swatch--beige"
                    title="Beżowy"
                  ></button>
                  <button
                    className="color-swatch color-swatch--brown"
                    title="Brązowy"
                  ></button>
                  <button
                    className="color-swatch color-swatch--slate"
                    title="Zgaszony błękit"
                  ></button>
                  <button
                    className="color-swatch color-swatch--olive"
                    title="Oliwkowy"
                  ></button>
                  <button
                    className="color-swatch color-swatch--grey"
                    title="Szary"
                  ></button>
                  <button
                    className="color-swatch color-swatch--black"
                    title="Czarny"
                  ></button>
                </div>
              </div>
            </div>
          </aside>

          <div className="products-page__main">
            <div className="products-page__toolbar">
              <span className="products-count">
                Pokazano {products.length}{" "}
                {getPluralProductForm(products.length)}
              </span>
              <SortSelect value={sortOption} onChange={handleSortChange} />
            </div>

            <div className="products-page__grid">
              {isLoading ? (
                <div className="products-page__loader-wrapper">
                  <Loader message="Pobieranie produktów..." />
                </div>
              ) : error ? (
                <div className="products-page__error-wrapper">
                  <ErrorState message={error} onRetry={fetchProducts} />
                </div>
              ) : currentProducts.length > 0 ? (
                // ZMIANA: Używamy currentProducts, a nie od razu sortedProducts
                currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isNew={isProductNew(product.created_at)}
                  />
                ))
              ) : (
                <p className="products-page__empty">
                  Brak produktów spełniających kryteria.
                </p>
              )}
            </div>

            {/* ZMIANA: WYŚWIETLENIE KOMPONENTU PAGINACJI */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;
