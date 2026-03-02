import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AboutUs from "./pages/AboutUs";
import Complaints from "./pages/Complaints";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/o-marce",
    element: <AboutUs />,
  },
  {
    path: "/zwroty-reklamacje",
    element: <Complaints />,
  },
  {
    path: "/platnosc-udana",
    element: <PaymentSuccess />,
  },
  {
    path: "/platnosc-anulowana",
    element: <PaymentCancel />,
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
