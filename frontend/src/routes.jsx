import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AboutUs from "./pages/AboutUs";
import Complaints from "./pages/Complaints";
import Products from "./pages/Products";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/o-marce", element: <AboutUs /> },
  { path: "/zwroty-reklamacje", element: <Complaints /> },
  { path: "/platnosc-udana", element: <PaymentSuccess /> },
  { path: "/platnosc-anulowana", element: <PaymentCancel /> },

  // --- ROUTY DLA SKLEPU ---
  // 1. Główny sklep (wszystkie produkty)
  { path: "/sklep", element: <Products /> },

  // 2. Wyniki wyszukiwania
  { path: "/szukaj", element: <Products /> },

  // 3. Łapie główne kategorie, np. /kolekcja-snu
  { path: "/:category", element: <Products /> },

  // 4. Łapie podkategorie, np. /kategoria/kolekcja-snu/materace
  { path: "/:category/:subcategory", element: <Products /> },

  // Catcher błędów
  { path: "*", element: <NotFound /> },
];

export default routes;
