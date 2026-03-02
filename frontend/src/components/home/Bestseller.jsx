import { useState, useEffect } from "react";
import { productApi } from "../../utils/api";
import Button from "../ui/Button";
import "../../styles/components/home/bestseller.scss";
import { formatPrice } from "../../utils/formatPrice";

// Pomocnicza stała do budowania pełnych ścieżek do zdjęć z backendu
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const Bestseller = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tablica dostępnych motywów kolorystycznych dla tła
  const themes = ["slate", "olive", "brown"];

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await productApi.getBestsellers();
        // Pobieramy dane i przypisujemy do stanu (max 3, jak zwraca API)
        setBestsellers(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania bestsellerów:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Funkcja bezpiecznie budująca URL zdjęcia
  const getImageUrl = (imagePath) => {
    if (!imagePath) return ""; // Puste, jeśli brak zdjęcia
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  if (isLoading) {
    return null; // Można tu dać <div className="bestseller-loading">...</div>, ale na start 'null' zapobiega skokom układu
  }

  if (bestsellers.length === 0) {
    return null; // Jeśli nie ma bestsellerów, nie renderujemy całej sekcji
  }

  return (
    <section className="bestseller-wrapper">
      {bestsellers.map((product, index) => {
        // Logika szachownicy: Jeśli indeks jest nieparzysty (czyli co drugi element), dodaj klasę reversed
        const isReversed = index % 2 !== 0;

        // Przypisywanie motywu z tablicy po kolei (slate -> olive -> brown)
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
                  {/* Zakładam, że w obiekcie product może być badge, jeśli nie, używam twardego tekstu */}
                  {product.badge || "Bestseller Miesiąca"}
                </span>
                <h2>{product.name}</h2>
                <p>{product.short_description}</p>
                <p className="bestseller__price">
                  od {formatPrice(product.price_brut)} zł
                </p>
                <Button
                  to={`/produkt/${product.slug || product.id}`}
                  variant={`outline-${currentTheme}`}
                >
                  Zobacz produkt
                </Button>
              </div>
              <div className="bestseller__image">
                <img src={getImageUrl(product.main_image)} alt={product.name} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Bestseller;
