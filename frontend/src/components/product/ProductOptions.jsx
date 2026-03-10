import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/product/product-options.scss";

// Adres URL bazy dla zdjęć atrybutów (tkanin)
const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

const ProductOptions = ({
  sizes,
  fabrics,
  selectedSize,
  setSelectedSize,
  selectedFabric,
  setSelectedFabric,
}) => {
  // Pomocnicza funkcja do budowania URL dla tekstur materiałów
  const getTextureUrl = (filename) => {
    if (!filename) return null;
    return `${BACKEND_URL}/uploads/attributes/${filename}`;
  };

  return (
    <>
      {sizes.length > 0 && (
        <div className="product-options">
          <h3 className="product-options__title">Wybierz rozmiar:</h3>
          <div className="product-options__group">
            {sizes.map((size) => (
              <button
                key={size.value_id}
                className={`option-btn ${selectedSize?.value_id === size.value_id ? "active" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                <span className="option-btn__text">{size.value}</span>
                {Number(size.price_modifier) > 0 && (
                  <span className="modifier">
                    (+{formatPrice(size.price_modifier)} zł)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {fabrics.length > 0 && (
        <div className="product-options">
          <h3 className="product-options__title">Wybierz tkaninę:</h3>
          <div className="product-options__group product-options__group--fabrics">
            {fabrics.map((fabric) => (
              <button
                key={fabric.value_id}
                className={`option-btn option-btn--fabric ${selectedFabric?.value_id === fabric.value_id ? "active" : ""}`}
                onClick={() => setSelectedFabric(fabric)}
              >
                {/* NOWOŚĆ: Wyświetlanie miniatury tkaniny, jeśli istnieje */}
                {fabric.image_url && (
                  <span
                    className="option-btn__texture"
                    style={{
                      backgroundImage: `url(${getTextureUrl(fabric.image_url)})`,
                    }}
                  />
                )}

                <span className="option-btn__text">{fabric.value}</span>

                {Number(fabric.price_modifier) > 0 && (
                  <span className="modifier">
                    (+{formatPrice(fabric.price_modifier)} zł)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductOptions;
