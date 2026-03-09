import "../../styles/components/ui/quantity-selector.scss";

const QuantitySelector = ({ quantity, setQuantity, min = 1, max = 99 }) => {
  const handleDecrease = () => {
    setQuantity((q) => Math.max(min, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => Math.min(max, q + 1));
  };

  return (
    <div className="quantity-selector">
      <button onClick={handleDecrease} disabled={quantity <= min}>
        -
      </button>
      <span key={quantity} className="quantity-selector__display">
        {quantity}
      </span>
      <button onClick={handleIncrease} disabled={quantity >= max}>
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
