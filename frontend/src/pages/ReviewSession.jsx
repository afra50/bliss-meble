import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, MessageSquareHeart } from "lucide-react";
import Loader from "../components/ui/Loader";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import { reviewApi } from "../utils/api";

import "../styles/pages/review-session.scss";

const ReviewSession = () => {
  const { token } = useParams();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Stan dla aktualnie otwartego formularza
  const [activeProductId, setActiveProductId] = useState(null);
  const [formData, setFormData] = useState({
    rating: 0,
    authorName: "",
    comment: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await reviewApi.getSessionByToken(token);
        setProducts(res.data);
      } catch (err) {
        console.error("Błąd pobierania sesji:", err);
        setPageError(
          err.response?.data?.error ||
            "Link do oceny wygasł lub wszystkie produkty zostały już ocenione.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  const handleStarClick = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenForm = (productId) => {
    setActiveProductId(productId);
    setFormData({ rating: 0, authorName: "", comment: "" });
    setSubmitError(null);
  };

  const handleSubmit = async (e, productId) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setSubmitError("Proszę wybrać ocenę w skali od 1 do 5 gwiazdek.");
      return;
    }
    if (formData.authorName.trim().length < 2) {
      setSubmitError("Proszę podać poprawne imię (minimum 2 znaki).");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      await reviewApi.submitReview({
        token,
        product_id: productId,
        rating: formData.rating,
        author_name: formData.authorName,
        comment: formData.comment,
      });

      // Usuwamy oceniony produkt z listy
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      setActiveProductId(null);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
          "Wystąpił błąd podczas zapisywania opinii.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/assets/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;

    // ZMIANA: Bierzemy DOKŁADNIE to, co jest w .env (bez żadnego ucinania)
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    return `${baseUrl}/uploads/products/${imagePath}`;
  };

  if (isLoading) {
    return (
      <main className="review-session-page">
        <Loader message="Trwa ładowanie Twoich produktów..." />
      </main>
    );
  }

  // Gdy link wygasł lub klient ocenił już wszystko
  if (pageError || products.length === 0) {
    return (
      <main className="review-session-page">
        <div className="review-session__container">
          <div className="review-session__success-card">
            <CheckCircle size={64} color="#727a5e" />
            <h1>Dziękujemy!</h1>
            <p className="success-p">
              {pageError ||
                "Wszystkie produkty z tego zamówienia zostały już przez Ciebie ocenione."}
            </p>
            <Link to="/sklep">
              <Button variant="primary">Wróć do sklepu</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="review-session-page">
      <div className="review-session__container">
        <header className="review-session__header">
          <MessageSquareHeart size={48} className="header-icon" />
          <h1>Oceń swoje zakupy</h1>
          <p>
            Dziękujemy za zaufanie do Bliss Meble. Wybierz produkt z poniższej
            listy i podziel się swoją opinią.
          </p>
        </header>

        <div className="review-session__list">
          {products.map((product) => (
            <div key={product.product_id} className="review-item-card">
              <div className="review-item-card__info">
                <img src={getImageUrl(product.image)} alt={product.name} />
                <div className="details">
                  <h3>{product.name}</h3>
                  {activeProductId !== product.product_id && (
                    <Button
                      variant="outline-slate-dark"
                      onClick={() => handleOpenForm(product.product_id)}
                    >
                      Oceń ten produkt
                    </Button>
                  )}
                </div>
              </div>

              {activeProductId === product.product_id && (
                <form
                  className="review-form"
                  onSubmit={(e) => handleSubmit(e, product.product_id)}
                >
                  <h4>Twoja ocena</h4>
                  <div className="stars-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${formData.rating >= star ? "active" : ""}`}
                        onClick={() => handleStarClick(star)}
                      >
                        <Star
                          size={32}
                          fill={
                            formData.rating >= star ? "currentColor" : "none"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Imię / Podpis</label>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleChange}
                      placeholder="np. Anna K."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Twoja opinia (opcjonalnie)</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      placeholder="Napisz, co myślisz o jakości, wygodzie czy dostawie..."
                      rows="4"
                    ></textarea>
                  </div>

                  {submitError && (
                    <div className="form-error">{submitError}</div>
                  )}

                  <div className="form-actions">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Zapisywanie..." : "Wyślij opinię"}
                    </Button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setActiveProductId(null)}
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ReviewSession;
