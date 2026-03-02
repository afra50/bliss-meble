import { useState, useEffect } from "react";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";
import Loader from "../ui/Loader";
import ErrorState from "../ui/ErrorState"; // 1. IMPORTUJEMY KOMPONENT BŁĘDU
import { productApi } from "../../utils/api";
import "../../styles/components/home/featured-products.scss";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 2. DODAJEMY STAN BŁĘDU

  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  // 3. WYDZIELAMY FUNKCJĘ, ABY MÓC JĄ WYWOŁAĆ PONOWNIE (onRetry)
  const fetchRandomProducts = async () => {
    setIsLoading(true);
    setError(null); // Resetujemy błąd przed nową próbą
    try {
      const response = await productApi.getAll({});
      const allProducts = response.data;
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      setProducts(shuffled.slice(0, 3));
    } catch (error) {
      console.error("Błąd:", error);
      // 4. USTAWIAMY KOMUNIKAT BŁĘDU
      setError("Wystąpił problem z pobraniem polecanych produktów.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="featured">
        <div className="featured__container">
          <Loader message="Szukamy wyjątkowych produktów dla Ciebie..." />
        </div>
      </section>
    );
  }

  // 5. JEŚLI JEST BŁĄD, WYŚWIETLAMY ERRORSTATE Z FUNKCJĄ PONOWIENIA
  if (error) {
    return (
      <section className="featured">
        <div className="featured__container">
          <ErrorState message={error} onRetry={fetchRandomProducts} />
        </div>
      </section>
    );
  }

  return (
    <section className="featured">
      <div className="featured__container">
        <h2 className="featured__title">Wybrane produkty</h2>
        <div className="featured__grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isNew={isProductNew(product.created_at)}
            />
          ))}
        </div>

        <div className="featured__action">
          <Button to="/sklep" variant="primary">
            Zobacz wszystkie produkty
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
