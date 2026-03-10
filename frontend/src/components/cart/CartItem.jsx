import React from "react";
import { FaTimes } from "react-icons/fa";
import { formatPrice } from "../../utils/formatPrice";
import QuantitySelector from "../ui/QuantitySelector";
import defaultImg from "../../assets/default-product.jpg";
import "../../styles/components/cart/cart-item.scss";

const CartItem = ({
  item,
  index,
  updateQuantity,
  removeFromCart,
  isCompact = false,
}) => {
  const handleQuantityChange = (newQty) => {
    if (updateQuantity) updateQuantity(index, newQty);
  };

  const regularPrice = item.regular_price || item.price_brut;
  const isPromo =
    regularPrice && parseFloat(regularPrice) > parseFloat(item.price);

  // Oszczędność na jednej sztuce
  const savingsPerItem = isPromo
    ? parseFloat(regularPrice) - parseFloat(item.price)
    : 0;

  return (
    <div className={`cart-item ${isCompact ? "cart-item--compact" : ""}`}>
      <div className="cart-item__image">
        <img src={item.image || defaultImg} alt={item.name} />
      </div>

      <div className="cart-item__info">
        <h4 className="cart-item__name">{item.name}</h4>

        <div className="cart-item__attributes">
          {item.fabric && (
            <p>
              <span>Kolor:</span> {item.fabric}
            </p>
          )}
          {item.size && (
            <p>
              <span>Rozmiar:</span> {item.size}
            </p>
          )}
        </div>

        {/* WIDOK KOMPAKTOWY: 1 x 2400,00 zł */}
        {isCompact && (
          <div className="cart-item__compact-price">
            <span className="qty">{item.quantity}</span>
            <span className="times"> × </span>
            {isPromo ? (
              <div className="compact-price-wrap">
                <span className="current-price promo">
                  {formatPrice(item.price)} zł
                </span>
                <span className="old-price">
                  {formatPrice(regularPrice)} zł
                </span>
              </div>
            ) : (
              <span className="current-price">
                {formatPrice(item.price)} zł
              </span>
            )}
          </div>
        )}

        {/* ZMIANA: OMNIBUS ORAZ INFO O OSZCZĘDNOŚCI DLA WIDOKU PEŁNEGO */}
        {!isCompact && isPromo && (
          <div className="cart-item__promo-info">
            <span className="save-badge">
              Oszczędzasz łącznie {formatPrice(savingsPerItem * item.quantity)}{" "}
              zł
            </span>
            {item.omnibusPrice && (
              <small className="omnibus-text">
                Najniższa cena z 30 dni: {formatPrice(item.omnibusPrice)} zł
              </small>
            )}
          </div>
        )}
      </div>

      {/* KONTROLKI (Duży koszyk) */}
      {!isCompact && (
        <div className="cart-item__actions">
          <div className="cart-item__price-unit">
            {isPromo ? (
              <div className="price-stack">
                <span className="current-price promo">
                  {formatPrice(item.price)} zł
                </span>
                <span className="old-price">
                  {formatPrice(regularPrice)} zł
                </span>
              </div>
            ) : (
              <span className="current-price">
                {formatPrice(item.price)} zł
              </span>
            )}
          </div>
          <div className="cart-item__qty">
            <QuantitySelector
              quantity={item.quantity}
              setQuantity={handleQuantityChange}
              max={99}
            />
          </div>
          <div className="cart-item__total">
            {formatPrice(item.price * item.quantity)} zł
          </div>
        </div>
      )}

      <button
        className="cart-item__remove"
        onClick={() => removeFromCart(index)}
        title="Usuń z koszyka"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default CartItem;
