import { useState, useEffect } from "react";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard"; // IMPORTUJEMY!
import { productApi } from "../../utils/api";
import "../../styles/components/home/featured-products.scss";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    const addedDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return addedDate >= thirtyDaysAgo;
  };

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const response = await productApi.getAll({});
        const allProducts = response.data;
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Błąd:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRandomProducts();
  }, []);

  if (isLoading) {
    return <div className="featured__loading">Ładowanie produktów...</div>;
  }

  return (
    <section className="featured">
      <div className="featured__container">
        <h2 className="featured__title">Wybrane produkty</h2>
        <div className="featured__grid">
          {/* UŻYWAMY KOMPONENTU KARTY */}
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
