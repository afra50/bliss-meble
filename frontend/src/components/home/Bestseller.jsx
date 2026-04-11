import { useState, useEffect } from "react";
import { productApi } from "../../utils/api";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import ErrorState from "../ui/ErrorState";
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/components/home/bestseller.scss";
import { formatPrice } from "../../utils/formatPrice";

// --- USUNIĘTO SKOMPLIKOWANY BACKEND_URL ---

const Bestseller = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const themes = ["slate", "olive", "brown"];

  const fetchBestsellers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productApi.getBestsellers();
      setBestsellers(response.data);
    } catch (error) {
      console.error("Błąd podczas pobierania bestsellerów:", error);
      setError("Nie udało się wczytać bestsellerów.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, []);

  // --- ZMIANA: NOWA LOGIKA GENEROWANIA URL ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;

    // Budujemy czysty adres: https://blissmeble.pl/api + /uploads/products/ + obrazek.jpg
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/products/${imagePath}`;
  };

  if (isLoading) {
    return (
      <section className="bestseller-wrapper">
        <Loader message="Przygotowujemy bestsellery miesiąca..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bestseller-wrapper">
        <ErrorState message={error} onRetry={fetchBestsellers} />
      </section>
    );
  }

  if (bestsellers.length === 0) return null;

  return (
    <section className="bestseller-wrapper">
      {bestsellers.map((product, index) => {
        const isReversed = index % 2 !== 0;
        const currentTheme = themes[index % themes.length];

        // LOGIKA PROMOCYJNA
        const isPromo =
          product.promotional_price &&
          parseFloat(product.promotional_price) > 0;
        const regularPrice = parseFloat(product.price_brut);
        const currentPrice = isPromo
          ? parseFloat(product.promotional_price)
          : regularPrice;
        const savedAmount = isPromo ? regularPrice - currentPrice : 0;

        return (
          <article
            key={product.id}
            className={`bestseller bestseller--${currentTheme} ${
              isReversed ? "bestseller--reversed" : ""
            }`}
          >
            <div className="bestseller__container bestseller__grid">
              <div className="bestseller__text">
                <span className="bestseller__badge">
                  {product.badge || "Bestseller Miesiąca"}
                </span>

                <h2>{product.name}</h2>
                <p>{product.short_description}</p>

                {/* ZMIANA: WYŚWIETLANIE CENY W TYM PROMOCJI */}
                <div className="bestseller__price-wrap">
                  {isPromo ? (
                    <>
                      <div className="old-price-row">
                        <span className="bestseller__price-old">
                          {formatPrice(regularPrice)} zł
                        </span>
                        <span className="bestseller__price-save">
                          Oszczędzasz {formatPrice(savedAmount)} zł
                        </span>
                      </div>
                      <p className="bestseller__price bestseller__price--promo">
                        od {formatPrice(currentPrice)} zł
                      </p>
                    </>
                  ) : (
                    <p className="bestseller__price">
                      od {formatPrice(currentPrice)} zł
                    </p>
                  )}
                </div>

                <Button
                  to={`/sklep/${product.slug}`}
                  variant={`outline-${currentTheme}`}
                >
                  Zobacz produkt
                </Button>
              </div>
              <div className="bestseller__image">
                <img
                  src={getImageUrl(product.main_image)}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = defaultImg;
                  }}
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Bestseller;
