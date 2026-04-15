import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingBasket,
  FaArrowRight,
  FaShieldAlt,
  FaAward,
  FaInfoCircle,
  FaRegCreditCard,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import CartItem from "../components/cart/CartItem";
import Button from "../components/ui/Button";
import CheckoutStepper from "../components/checkout/CheckoutStepper";

import "../styles/pages/cart-page.scss";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartTotalSavings,
  } = useCart();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/zamowienie");
  };

  const vatAmount = cartTotal - cartTotal / 1.23;

  // NOWOŚĆ: Logika sprawdzająca, czy w koszyku jest mebel.
  // UWAGA: Upewnij się, jak w Twoim obiekcie "item" zapisana jest kategoria!
  // Tutaj zakładam, że kategoria z dodatkami ma nazwę "Dodatki" (lub dopisz odpowiednie ID kategorii, np. item.category_id !== 3)
  const hasFurniture = cartItems.some(
    (item) =>
      item.category_name !== "Dodatki" && item.subcategory_name !== "Dodatki",
  );

  return (
    <main className="cart-page">
      <div className="cart-page__container">
        <CheckoutStepper currentStep={1} />

        <h1 className="cart-page__title">Twój Koszyk</h1>

        {cartItems.length === 0 ? (
          <div className="cart-page__empty">
            <FaShoppingBasket className="empty-icon" />
            <h2>Twój koszyk jest pusty</h2>
            <p>
              Nie masz jeszcze żadnych produktów w koszyku. Wróć do sklepu i
              znajdź coś dla siebie!
            </p>
            <Link to="/sklep">
              <Button variant="primary">Przejdź do sklepu</Button>
            </Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            <div className="cart-page__items-list">
              <div className="cart-page__list-header">
                <div className="col-product">PRODUKT</div>
                <div className="col-actions">
                  <span>CENA</span>
                  <span>ILOŚĆ</span>
                  <span>KWOTA</span>
                </div>
              </div>

              <div className="cart-page__items">
                {cartItems.map((item, index) => (
                  <CartItem
                    // NOWOŚĆ: Dodano item.side ORAZ item.headrest do klucza
                    key={`${item.id}-${item.size}-${item.fabric}-${item.side}-${item.headrest}`}
                    item={item}
                    index={index}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    isCompact={false}
                  />
                ))}
              </div>

              <div className="cart-page__reservation-info">
                <FaInfoCircle className="info-icon" />
                <p>
                  <strong>Ważne:</strong> Dodanie produktów do koszyka nie
                  oznacza ich rezerwacji. Nie zwlekaj z zakupem!
                </p>
              </div>

              <div className="cart-page__continue-shopping">
                <Link to="/sklep" className="link-back">
                  &larr; Kontynuuj zakupy
                </Link>
              </div>
            </div>

            <aside className="cart-page__summary">
              <div className="summary-box">
                <h3 className="summary-box__title">PODSUMOWANIE KOSZYKA</h3>

                <div className="summary-box__row">
                  <span>Wartość koszyka</span>
                  <span className="price-nowrap">
                    {cartTotalSavings > 0 ? (
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "#94a3b8",
                          marginRight: "8px",
                        }}
                      >
                        {formatPrice(cartTotal + cartTotalSavings)} zł
                      </span>
                    ) : null}
                    {formatPrice(cartTotal)} zł
                  </span>
                </div>

                {/* ZMIANA: Dynamiczna informacja o wysyłce */}
                <div className="summary-box__row summary-box__row--shipping">
                  <span>Wysyłka</span>
                  <div className="shipping-info" style={{ textAlign: "right" }}>
                    {hasFurniture ? (
                      <p className="free-shipping">Darmowa dostawa!</p>
                    ) : (
                      <p className="cost-shipping">
                        Koszty zostaną obliczone w kolejnym kroku.
                      </p>
                    )}
                  </div>
                </div>

                <div className="summary-box__total">
                  <span>Łącznie</span>
                  <div className="total-price">
                    <strong className="price-nowrap">
                      {formatPrice(cartTotal)} zł
                    </strong>
                    <small>(w tym {formatPrice(vatAmount)} zł VAT)</small>

                    {cartTotalSavings > 0 && (
                      <div className="summary-box__savings">
                        Zyskujesz z rabatami:{" "}
                        <strong>{formatPrice(cartTotalSavings)} zł</strong>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="summary-box__btn"
                  onClick={handleProceedToCheckout}
                >
                  PRZEJDŹ DO ZAMÓWIENIA
                </Button>
              </div>

              <div className="trust-badges">
                <div className="trust-badges__item">
                  <FaShieldAlt />
                  <span>Bezpieczne zakupy</span>
                </div>
                <div className="trust-badges__item">
                  <FaRegCreditCard />
                  <span>Szybkie płatności</span>
                </div>
                <div className="trust-badges__item">
                  <FaAward />
                  <span>2 lata gwarancji producenta</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
