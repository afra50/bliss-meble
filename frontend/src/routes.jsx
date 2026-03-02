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
	{ path: "/sklep", element: <Products /> },
	{ path: "/szukaj", element: <Products /> },
	{ path: "/:category", element: <Products /> },
	{ path: "/:category/:subcategory", element: <Products /> },

	{ path: "*", element: <NotFound /> },
];

export default routes;
