import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/product/product-options.scss";

const ProductOptions = ({
  sizes,
  fabrics,
  selectedSize,
  setSelectedSize,
  selectedFabric,
  setSelectedFabric,
}) => {
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
                {size.value}
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
          <div className="product-options__group">
            {fabrics.map((fabric) => (
              <button
                key={fabric.value_id}
                className={`option-btn ${selectedFabric?.value_id === fabric.value_id ? "active" : ""}`}
                onClick={() => setSelectedFabric(fabric)}
              >
                {fabric.value}
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
