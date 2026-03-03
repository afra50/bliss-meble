import { useState, useEffect } from "react";
import { productApi } from "../../utils/api";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import ErrorState from "../ui/ErrorState"; // 1. IMPORTUJEMY KOMPONENT BŁĘDU
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/components/home/bestseller.scss";
import { formatPrice } from "../../utils/formatPrice";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const Bestseller = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 2. DODAJEMY STAN BŁĘDU

  const themes = ["slate", "olive", "brown"];

  // 3. WYDZIELAMY FUNKCJĘ POBIERANIA (ABY UŻYĆ JEJ W onRetry)
  const fetchBestsellers = async () => {
    setIsLoading(true);
    setError(null); // Resetujemy błąd przed każdą próbą
    try {
      const response = await productApi.getBestsellers();
      setBestsellers(response.data);
    } catch (error) {
      console.error("Błąd podczas pobierania bestsellerów:", error);
      setError("Nie udało się wczytać bestsellerów."); // 4. USTAWIDAMY KOMUNIKAT
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBestsellers();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  if (isLoading) {
    return (
      <section className="bestseller-wrapper">
        <Loader message="Przygotowujemy bestsellery miesiąca..." />
      </section>
    );
  }

  // 5. OBSŁUGA STANU BŁĘDU
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
                <p className="bestseller__price">
                  od {formatPrice(product.price_brut)} zł
                </p>
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
