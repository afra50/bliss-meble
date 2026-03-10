import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/App.scss";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext"; // <--- 1. IMPORT

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. OWIJAMY CAŁĄ APLIKACJĘ */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);
