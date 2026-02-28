import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import routes from "./routes";

// Ta funkcja zajmuje się renderowaniem odpowiedniej strony z routes.jsx
function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Header />

        <AppRoutes />

        <Footer />
      </div>
    </Router>
  );
}
