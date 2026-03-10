import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import CartItem from "./CartItem";
import Button from "../ui/Button";
import { formatPrice } from "../../utils/formatPrice";
import "../../styles/components/cart/mini-cart.scss";

const MiniCart = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  const content = (
    <div className="mini-cart-overlay" onClick={onClose}>
      <div
        className={`mini-cart ${isOpen ? "mini-cart--open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* NAGŁÓWEK JAK NA SCREENIE */}
        <div className="mini-cart__header">
          <h3>Koszyk</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes /> Zamknij
          </button>
        </div>

        <div className="mini-cart__body">
          {cartItems.length === 0 ? (
            <div className="mini-cart__empty">
              <p>Twój koszyk jest pusty.</p>
              <Button variant="primary" onClick={onClose}>
                Wróć do sklepu
              </Button>
            </div>
          ) : (
            <div className="mini-cart__items">
              {cartItems.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.size}-${item.fabric}`}
                  item={item}
                  index={index}
                  removeFromCart={removeFromCart}
                  isCompact={true} // Włączamy tryb czysty/kompaktowy
                />
              ))}
            </div>
          )}
        </div>

        {/* STOPKA W TWOIM STYLU */}
        {cartItems.length > 0 && (
          <div className="mini-cart__footer">
            <div className="subtotal">
              <span>Suma:</span>
              <strong>{formatPrice(cartTotal)} zł</strong>
            </div>

            <div className="action-buttons">
              {/* Zwykły link, ale ostylowany jako "outline" w Twoich kolorach */}
              <Link to="/koszyk" onClick={onClose} className="btn-view-cart">
                ZOBACZ KOSZYK
              </Link>
              {/* Twój natywny Button w wariancie primary */}
              <Button
                variant="primary"
                onClick={handleCheckoutClick}
                className="btn-checkout"
              >
                ZAMÓWIENIE
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default MiniCart;
