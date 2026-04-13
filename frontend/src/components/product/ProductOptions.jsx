import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/product/product-options.scss";

const ProductOptions = ({
  sizes,
  fabrics,
  selectedSize,
  setSelectedSize,
  selectedFabric,
  setSelectedFabric,
  // --- NOWE PROPSY ---
  isCornerSofa,
  selectedSide,
  setSelectedSide,
}) => {
  const getTextureUrl = (filename) => {
    if (!filename) return null;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/uploads/attributes/${filename}`;
  };

  return (
    <>
      {/* --- NOWOŚĆ: Wybór strony narożnika --- */}
      {isCornerSofa && (
        <div className="product-options">
          <h3 className="product-options__title">Wybierz stronę narożnika:</h3>
          <div className="product-options__group">
            <button
              className={`option-btn ${selectedSide === "lewy" ? "active" : ""}`}
              onClick={() => setSelectedSide("lewy")}
            >
              <span className="option-btn__text">Lewostronny</span>
            </button>
            <button
              className={`option-btn ${selectedSide === "prawy" ? "active" : ""}`}
              onClick={() => setSelectedSide("prawy")}
            >
              <span className="option-btn__text">Prawostronny</span>
            </button>
          </div>
        </div>
      )}

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
