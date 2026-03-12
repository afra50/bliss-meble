import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";

// Komponenty układu
import ShopHeader from "../components/shop/ShopHeader";
import ShopSidebar from "../components/shop/ShopSidebar";
import ProductCard from "../components/ui/ProductCard";
import NotFound from "./NotFound";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import SortSelect from "../components/ui/SortSelect";
import Pagination from "../components/ui/Pagination";

// Utils
import { productApi } from "../utils/api";
import { getPluralProductForm } from "../utils/grammar";
import { CATEGORIES, SUBCATEGORIES } from "../utils/categories";
import "../styles/pages/products.scss";

const ITEMS_PER_PAGE = 9;

// Definicja przedziałów cenowych
const PRICE_RANGES = [
  { id: "under1000", label: "Poniżej 1000 zł", min: 0, max: 999.99 },
  { id: "1000-3000", label: "1000 zł - 3000 zł", min: 1000, max: 3000 },
  { id: "over3000", label: "Powyżej 3000 zł", min: 3000.01, max: Infinity },
];

const Products = () => {
  const { category, subcategory } = useParams();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const colorQuery = searchParams.get("color") || "";
  const pricesQuery = searchParams.get("prices") || "";

  const activePriceRanges = useMemo(() => {
    return pricesQuery ? pricesQuery.split(",") : [];
  }, [pricesQuery]);

  const isAllProducts = location.pathname === "/sklep";
  const isSearch = location.pathname === "/szukaj";

  // Weryfikacja kategorii URL z naszymi stałymi (ochrona przed błędem 404)
  const currentCategoryObj = CATEGORIES.find((c) => c.slug === category);
  const currentSubcategoryObj = SUBCATEGORIES.find(
    (s) => s.slug === subcategory,
  );
  const isInvalidUrl =
    (!isAllProducts && !isSearch && category && !currentCategoryObj) ||
    (subcategory &&
      (!currentSubcategoryObj ||
        currentSubcategoryObj.category_id !== currentCategoryObj?.id));

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (isSearch && searchQuery) {
        response = await productApi.search(searchQuery);
      } else {
        const params = {
          category,
          subcategory,
          color: colorQuery,
          prices: pricesQuery,
        };
        response = await productApi.getAll(params);
      }

      // WYWALONO dataWithMockReviews!
      // Teraz bierzemy czyste dane, bo backend już przysłał average_rating i reviews_count
      setProducts(response.data);
    } catch (err) {
      setError("Wystąpił błąd podczas ładowania produktów.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInvalidUrl) {
      fetchProducts();
      setSortOption("newest");
      setCurrentPage(1);
    }
  }, [
    category,
    subcategory,
    isSearch,
    searchQuery,
    colorQuery,
    pricesQuery,
    isInvalidUrl,
  ]);

  // --- FUNKCJE OBSŁUGI ZDARZEŃ (SIDEBAR I NARZĘDZIA) ---

  const handleColorChange = (hexValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (colorQuery === hexValue) newParams.delete("color");
    else newParams.set("color", hexValue);
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePriceToggle = (rangeId) => {
    const newParams = new URLSearchParams(searchParams);
    let updatedRanges = [...activePriceRanges];

    if (updatedRanges.includes(rangeId)) {
      updatedRanges = updatedRanges.filter((id) => id !== rangeId);
    } else {
      updatedRanges.push(rangeId);
    }

    if (updatedRanges.length > 0)
      newParams.set("prices", updatedRanges.join(","));
    else newParams.delete("prices");

    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- LOGIKA FILTROWANIA I SORTOWANIA ---

  const filteredProducts = useMemo(() => {
    if (activePriceRanges.length === 0) return products;
    return products.filter((p) => {
      const price = Number(p.price_brut);
      return activePriceRanges.some((rangeId) => {
        const rangeDef = PRICE_RANGES.find((r) => r.id === rangeId);
        return rangeDef && price >= rangeDef.min && price <= rangeDef.max;
      });
    });
  }, [products, activePriceRanges]);

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    switch (sortOption) {
      case "rating_desc":
        return sorted.sort(
          (a, b) => Number(b.average_rating) - Number(a.average_rating),
        );
      case "price_desc":
        return sorted.sort(
          (a, b) => Number(b.price_brut) - Number(a.price_brut),
        );
      case "rating_desc":
        return sorted.sort(
          (a, b) => Number(b.mockRating) - Number(a.mockRating),
        );
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      case "oldest":
        return sorted.sort((a, b) => a.id - b.id);
      default:
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [filteredProducts, sortOption]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  // Wczesne wyjście w przypadku błędnego adresu url
  if (isInvalidUrl) return <NotFound />;

  // --- GŁÓWNY RENDER KONTROLERA ---

  return (
    <main className="products-page">
      <ShopHeader
        isSearch={isSearch}
        isAllProducts={isAllProducts}
        searchQuery={searchQuery}
        category={category}
        subcategory={subcategory}
      />

      <section className="products-page__content">
        <div className="products-page__container products-page__layout">
          <ShopSidebar
            currentCategorySlug={category}
            colorQuery={colorQuery}
            activePriceRanges={activePriceRanges}
            priceRanges={PRICE_RANGES}
            onColorChange={handleColorChange}
            onPriceToggle={handlePriceToggle}
          />

          <div className="products-page__main">
            <div className="products-page__toolbar">
              <span className="products-count">
                Pokazano {filteredProducts.length}{" "}
                {getPluralProductForm(filteredProducts.length)}
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
                currentProducts.map((product) => {
                  const isNew =
                    product.created_at &&
                    (new Date() - new Date(product.created_at)) /
                      (1000 * 60 * 60 * 24 * 30) <=
                      1; // szybkie sprawdzenie na "nowość" (30dni)
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isNew={isNew}
                    />
                  );
                })
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
