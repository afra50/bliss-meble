import { useState, useEffect, useMemo } from "react";
import {
  useParams,
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import NotFound from "./NotFound";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import SortSelect from "../components/ui/SortSelect";
import Pagination from "../components/ui/Pagination";
import { productApi } from "../utils/api";
import { getPluralProductForm } from "../utils/grammar";
import "../styles/pages/products.scss";

// NOWOŚĆ: Importujemy scentralizowane dane kategorii
import { CATEGORIES, SUBCATEGORIES } from "../utils/categories";

const ITEMS_PER_PAGE = 9;

const Products = () => {
  // Odczyt parametrów z URL (już zdekodowanych automatycznie przez react-router)
  const { category, subcategory } = useParams();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const isAllProducts = location.pathname === "/sklep";
  const isSearch = location.pathname === "/szukaj";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

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
      let response;
      if (isSearch && searchQuery) {
        response = await productApi.search(searchQuery);
      } else {
        const params = {};
        if (category) params.category = category;
        if (subcategory) params.subcategory = subcategory;
        response = await productApi.getAll(params);
      }
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
    setSortOption("default");
    setCurrentPage(1);
  }, [category, subcategory, isSearch, searchQuery]);

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

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- ZMIANA: Dynamiczna Walidacja Kategorii ---
  // Sprawdzamy czy wpisany w URL /kategoria/podkategoria faktycznie istnieje
  const currentCategoryObj = CATEGORIES.find((c) => c.slug === category);
  const currentSubcategoryObj = SUBCATEGORIES.find(
    (s) => s.slug === subcategory,
  );

  if (!isAllProducts && !isSearch && category) {
    if (!currentCategoryObj) {
      return <NotFound />;
    }
    if (
      subcategory &&
      (!currentSubcategoryObj ||
        currentSubcategoryObj.category_id !== currentCategoryObj.id)
    ) {
      return <NotFound />;
    }
  }

  // --- ZMIANA: Tytuł na podstawie naszych danych z utils ---
  let pageTitle = "Wszystkie produkty";
  if (isSearch) {
    pageTitle = searchQuery
      ? `Wyniki dla "${searchQuery}"`
      : "Wyniki wyszukiwania";
  } else if (subcategory) {
    pageTitle = currentSubcategoryObj?.name;
  } else if (category) {
    pageTitle = currentCategoryObj?.name;
  }

  // --- ZMIANA: Breadcrumbs na podstawie naszych danych z utils ---
  const buildBreadcrumbPaths = () => {
    const paths = [];
    if (isSearch) {
      paths.push({ label: "Szukaj" });
    } else if (isAllProducts) {
      paths.push({ label: "Sklep" });
    } else {
      paths.push({ label: "Sklep", to: "/sklep" });
      if (category && currentCategoryObj) {
        paths.push({
          label: currentCategoryObj.name,
          to: subcategory ? `/${currentCategoryObj.slug}` : null,
        });
      }
      if (subcategory && currentSubcategoryObj) {
        paths.push({ label: currentSubcategoryObj.name });
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

              {/* ZMIANA: DYNAMICZNIE RENDEROWANY AKORDION KATEGORII */}
              <div className="filter-accordion">
                {CATEGORIES.map((cat) => {
                  // Szukamy podkategorii przypisanych do tej konkretnej kategorii głównej
                  const catSubcategories = SUBCATEGORIES.filter(
                    (sub) => sub.category_id === cat.id,
                  );

                  // Jeśli kategoria (np. "Zestawy") nie ma podkategorii, wyświetlamy zwykły link
                  if (catSubcategories.length === 0) {
                    return (
                      <div key={cat.id} className="filter-accordion-item">
                        <Link
                          to={`/${cat.slug}`}
                          className="filter-accordion-link"
                        >
                          {cat.name}
                        </Link>
                      </div>
                    );
                  }

                  // Jeśli kategoria ma podkategorie, wyświetlamy rozwijany details (akordion)
                  return (
                    <details
                      key={cat.id}
                      className="filter-accordion-item"
                      // Akordion będzie domyślnie rozwinięty, jeśli pasuje do aktualnego URL
                      open={category === cat.slug}
                    >
                      <summary>{cat.name}</summary>
                      <ul>
                        <li className="view-all">
                          <Link to={`/${cat.slug}`}>Pokaż wszystko</Link>
                        </li>
                        {catSubcategories.map((sub) => (
                          <li key={sub.id}>
                            {/* Tworzymy prawidłowy ścieżkę: /kategoria-glowna/podkategoria */}
                            <Link to={`/${cat.slug}/${sub.slug}`}>
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                })}
              </div>
            </div>

            {/* Reszta filtrów (Cena, Materiał, Kolor) pozostaje na razie statyczna */}
            <div className="filter-group">
              <h3>Filtruj</h3>

              <div className="filter-subgroup">
                <h4>Cena</h4>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price1" />
                  <label htmlFor="price1">Poniżej 1000 zł</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price2" />
                  <label htmlFor="price2">1000 zł - 3000 zł</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="price3" />
                  <label htmlFor="price3">Powyżej 3000 zł</label>
                </div>
              </div>

              <div className="filter-subgroup">
                <h4>Materiał</h4>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat1" />
                  <label htmlFor="mat1">Welur</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat2" />
                  <label htmlFor="mat2">Boucle</label>
                </div>
                <div className="custom-checkbox">
                  <input type="checkbox" id="mat3" />
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

            {totalPages > 1 && (
              <div className="products-page__pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;
