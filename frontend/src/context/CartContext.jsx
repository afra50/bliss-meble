import React, { createContext, useContext, useState, useEffect } from "react";

// Tworzymy Context
const CartContext = createContext();

// Własny Hook dla wygody
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // 1. Inicjalizacja koszyka z localStorage (żeby nie tracić danych po F5)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("bliss_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Zapisywanie do localStorage za każdym razem, gdy koszyk się zmieni
  useEffect(() => {
    localStorage.setItem("bliss_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 3. Funkcja DODAWANIA do koszyka
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.fabric === newItem.fabric,
      );

      if (existingItemIndex >= 0) {
        // Klonujemy całą tablicę
        const updatedItems = [...prevItems];

        // KLUCZOWA ZMIANA: Klonujemy też konkretny obiekt, zanim zmienimy mu ilość!
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };

        return updatedItems;
      } else {
        // Jeśli nie, dodajemy jako nową pozycję
        return [...prevItems, newItem];
      }
    });
  };

  // 4. Funkcja USUWANIA z koszyka
  const removeFromCart = (indexToRemove) => {
    setCartItems((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove),
    );
  };

  // 5. Funkcja do zmiany ilości konkretnego przedmiotu w koszyku
  const updateQuantity = (indexToUpdate, newQuantity) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[indexToUpdate].quantity = newQuantity;
      return updatedItems;
    });
  };

  // 6. Czyszczenie całego koszyka (np. po udanym zamówieniu)
  const clearCart = () => {
    setCartItems([]);
  };

  // --- WARTOŚCI POCHODNE (Wyliczane w locie) ---
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Wartość do zapłaty (po obniżkach)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // NOWOŚĆ: Wyliczamy łączną kwotę oszczędności z całego koszyka
  const cartTotalSavings = cartItems.reduce((sum, item) => {
    // Jeśli mamy regularną cenę i jest ona wyższa niż obecna cena sprzedaży
    const regularPrice = item.regular_price || item.price_brut;
    if (regularPrice && parseFloat(regularPrice) > parseFloat(item.price)) {
      const savedOnOneItem = parseFloat(regularPrice) - parseFloat(item.price);
      return sum + savedOnOneItem * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        cartTotalSavings, // <--- Eksportujemy nową wartość do całej aplikacji!
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
