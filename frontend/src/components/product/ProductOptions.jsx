import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/product/product-options.scss";

const ProductOptions = ({
  sizes,
  fabrics,
  headrests, // <-- NOWY PROP
  selectedSize,
  setSelectedSize,
  selectedFabric,
  setSelectedFabric,
  selectedHeadrest, // <-- NOWY PROP
  setSelectedHeadrest, // <-- NOWY PROP
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
      {/* WYBÓR STRONY NAROŻNIKA */}
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

      {/* NOWOŚĆ: WYBÓR ZAGŁÓWKÓW */}
      {headrests && headrests.length > 0 && (
        <div className="product-options">
          <h3 className="product-options__title">
            Ilość regulowanych zagłówków:
          </h3>
          <div className="product-options__group">
            {headrests.map((hr) => {
              // Mały trik gramatyczny, żeby 5 to było "zagłówków", a 3,4 to "zagłówki"
              const word = ["2", "3", "4"].includes(hr.value)
                ? "zagłówki"
                : "zagłówków";
              const isFree = Number(hr.price_modifier) === 0;

              return (
                <button
                  key={hr.value_id}
                  className={`option-btn ${selectedHeadrest?.value_id === hr.value_id ? "active" : ""}`}
                  onClick={() => setSelectedHeadrest(hr)}
                >
                  <span className="option-btn__text">
                    {hr.value} {word}
                  </span>

                  {/* Wyświetlamy darmowe jako "standardowo", a płatne z dopłatą */}
                  <span className="modifier">
                    {isFree
                      ? "(standardowo)"
                      : `(+${formatPrice(hr.price_modifier)} zł)`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WYBÓR ROZMIARU */}
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

      {/* WYBÓR TKANINY */}
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
