import React, { useState, useEffect, useMemo } from "react";
// NOWOŚĆ: Zaimportowano Clock i CheckCircle dla statusów
import { Trash2, Check, Star, Clock, CheckCircle } from "lucide-react";
import "../../styles/pages/admin/admin-reviews.scss";

import AdminSearchBar from "../../components/admin/AdminSearchBar";
import CustomSelect from "../../components/ui/CustomSelect";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ToastAlert from "../../components/ui/ToastAlert";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";

import { reviewApi } from "../../utils/api";
import defaultImg from "../../assets/default-product.jpg";

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState({
    value: "all",
    label: "Wszystkie oceny",
  });
  const [sortFilter, setSortFilter] = useState({
    value: "newest",
    label: "Od najnowszych",
  });
  const [productFilter, setProductFilter] = useState({
    value: "all",
    label: "Wszystkie produkty",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    action: null,
    reviewId: null,
    title: "",
    message: "",
    variant: "danger",
    confirmText: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const fetchReviews = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await reviewApi.getAdminAll();
      setReviews(response.data);
    } catch (err) {
      console.error("Błąd pobierania recenzji:", err);
      setError("Nie udało się załadować recenzji z serwera.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openDialog = (action, reviewId) => {
    if (action === "delete") {
      setDialogConfig({
        isOpen: true,
        action: "delete",
        reviewId,
        title: "Usuń recenzję",
        message: "Czy na pewno chcesz bezpowrotnie usunąć tę recenzję?",
        variant: "danger",
        confirmText: "Usuń",
      });
    } else if (action === "accept") {
      setDialogConfig({
        isOpen: true,
        action: "accept",
        reviewId,
        title: "Zaakceptuj recenzję",
        message:
          "Czy na pewno chcesz opublikować tę recenzję na stronie sklepu?",
        variant: "primary",
        confirmText: "Zaakceptuj",
      });
    }
  };

  const closeDialog = () => {
    if (!isProcessing) {
      setDialogConfig({ ...dialogConfig, isOpen: false });
    }
  };

  const closeToast = () => {
    setToastConfig({ ...toastConfig, isOpen: false });
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (dialogConfig.action === "delete") {
        await reviewApi.reject(dialogConfig.reviewId);
        setToastConfig({
          isOpen: true,
          message: "Recenzja została pomyślnie usunięta.",
          type: "success",
        });
      } else if (dialogConfig.action === "accept") {
        await reviewApi.approve(dialogConfig.reviewId);
        setToastConfig({
          isOpen: true,
          message: "Recenzja została zaakceptowana i jest widoczna w sklepie.",
          type: "success",
        });
      }
      closeDialog();
      fetchReviews();
    } catch (err) {
      console.error("Błąd akcji na recenzji:", err);
      closeDialog();
      setToastConfig({
        isOpen: true,
        message: "Wystąpił błąd podczas zapisywania zmian.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const productOptions = useMemo(() => {
    const uniqueProducts = Array.from(new Set(reviews.map((r) => r.product_id)))
      .filter((id) => id != null)
      .map((id) => {
        const review = reviews.find((r) => r.product_id === id);
        return {
          value: String(id),
          label: review.product_name || `Produkt #${id}`,
        };
      });
    return [{ value: "all", label: "Wszystkie produkty" }, ...uniqueProducts];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.comment?.toLowerCase().includes(query) ||
          r.author_name?.toLowerCase().includes(query) ||
          r.product_name?.toLowerCase().includes(query),
      );
    }
    if (ratingFilter.value !== "all") {
      result = result.filter((r) => String(r.rating) === ratingFilter.value);
    }
    if (productFilter.value !== "all") {
      result = result.filter(
        (r) => String(r.product_id) === productFilter.value,
      );
    }
    if (sortFilter.value === "newest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return result;
  }, [reviews, searchQuery, ratingFilter, sortFilter, productFilter]);

  const pendingReviews = filteredReviews.filter((r) => r.is_approved === 0);
  const approvedReviews = filteredReviews.filter((r) => r.is_approved === 1);

  const totalApprovedPages = Math.ceil(approvedReviews.length / ITEMS_PER_PAGE);
  const currentApprovedReviews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return approvedReviews.slice(start, start + ITEMS_PER_PAGE);
  }, [approvedReviews, currentPage]);

  const ratingOptions = [
    { value: "all", label: "Wszystkie oceny" },
    { value: "5", label: "5 gwiazdek" },
    { value: "4", label: "4 gwiazdki" },
    { value: "3", label: "3 gwiazdki" },
    { value: "2", label: "2 gwiazdki" },
    { value: "1", label: "1 gwiazdka" },
  ];

  const sortOptions = [
    { value: "newest", label: "Od najnowszych" },
    { value: "oldest", label: "Od najstarszych" },
  ];

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? "#eab308" : "transparent"}
            color={star <= rating ? "#eab308" : "#cbd5e1"}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}/uploads/products/${imagePath}`;
  };

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <div className="reviews-title">
          <h1>Zarządzanie Recenzjami</h1>
          <p className="sub-info">
            Liczba recenzji: {reviews.length} (oczekujących:{" "}
            {pendingReviews.length})
          </p>
        </div>
      </header>

      <div className="reviews-toolbar">
        <div className="search-wrapper">
          <AdminSearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj recenzji po treści lub autorze..."
          />
        </div>

        <div className="filters">
          <CustomSelect
            options={productOptions}
            value={productFilter}
            onChange={setProductFilter}
            isSearchable={true}
          />
          <CustomSelect
            options={ratingOptions}
            value={ratingFilter}
            onChange={setRatingFilter}
          />
          <CustomSelect
            options={sortOptions}
            value={sortFilter}
            onChange={setSortFilter}
          />
        </div>
      </div>

      {isLoadingData ? (
        <Loader message="Wczytywanie recenzji..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReviews} />
      ) : (
        <>
          <section className="reviews-section">
            <h2 className="reviews-title">Oczekujące na akceptację</h2>
            {pendingReviews.length === 0 ? (
              <p style={{ color: "#64748b" }}>Brak oczekujących recenzji.</p>
            ) : (
              <div className="reviews-table-wrapper">
                <table className="reviews-table">
                  <colgroup>
                    <col style={{ width: "130px" }} />{" "}
                    {/* Miniatura - sztywne 120px, żeby napis się nie zawijał */}
                    <col style={{ width: "20%" }} /> {/* Produkt */}
                    <col style={{ width: "16%" }} /> {/* Autor */}
                    <col style={{ width: "12%" }} /> {/* Ocena */}
                    <col style={{ width: "30%" }} />{" "}
                    {/* Treść - najwięcej miejsca na tekst opinii */}
                    <col style={{ width: "100px" }} />{" "}
                    {/* Status - sztywne 80px, bo ikonka zajmuje mało miejsca */}
                    <col style={{ width: "100px" }} />{" "}
                    {/* Akcje - sztywne 100px dla 1-2 przycisków */}
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Miniatura</th>
                      <th>Produkt</th>
                      <th>Autor</th>
                      <th>Ocena</th>
                      <th>Treść</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReviews.map((review) => (
                      <tr key={`pending-${review.id}`}>
                        <td className="td-img">
                          <div className="img-wrapper">
                            <img
                              src={getImageUrl(review.main_image)}
                              alt={review.product_name || "Produkt"}
                              onError={(e) => {
                                e.target.src = defaultImg;
                              }}
                            />
                          </div>
                        </td>
                        <td className="td-main">
                          <strong>{review.product_name || "Brak nazwy"}</strong>
                          <span className="sub-info">
                            ID: #{review.product_id}
                          </span>
                        </td>
                        <td className="td-main">
                          <strong>{review.author_name}</strong>
                          <span className="sub-info">
                            {formatDate(review.created_at)}
                          </span>
                          {review.is_verified === 1 && (
                            <span
                              style={{
                                color: "#16a34a",
                                fontSize: "0.75rem",
                                display: "block",
                              }}
                            >
                              ✓ Zweryfikowany
                            </span>
                          )}
                        </td>
                        <td>{renderStars(review.rating)}</td>
                        <td className="td-review-text">{review.comment}</td>
                        <td style={{ textAlign: "center" }}>
                          {/* ZMIANA: Zamiast tekstu, wyświetlamy czytelną ikonę z tooltipem */}
                          <Clock
                            className="status-icon pending"
                            size={24}
                            title="Oczekująca na weryfikację"
                          />
                        </td>
                        <td className="td-actions">
                          <div className="actions-container">
                            <button
                              className="action-btn accept"
                              title="Zaakceptuj i opublikuj"
                              onClick={() => openDialog("accept", review.id)}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Odrzuć i usuń"
                              onClick={() => openDialog("delete", review.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="reviews-section">
            <h2 className="reviews-title">Zaakceptowane recenzje</h2>
            {approvedReviews.length === 0 ? (
              <p style={{ color: "#64748b" }}>Brak zaakceptowanych recenzji.</p>
            ) : (
              <>
                <div className="reviews-table-wrapper">
                  <table className="reviews-table">
                    <colgroup>
                      <col style={{ width: "120px" }} />{" "}
                      {/* Miniatura - sztywne 120px, żeby napis się nie zawijał */}
                      <col style={{ width: "20%" }} /> {/* Produkt */}
                      <col style={{ width: "16%" }} /> {/* Autor */}
                      <col style={{ width: "12%" }} /> {/* Ocena */}
                      <col style={{ width: "30%" }} />{" "}
                      {/* Treść - najwięcej miejsca na tekst opinii */}
                      <col style={{ width: "80px" }} />{" "}
                      {/* Status - sztywne 80px, bo ikonka zajmuje mało miejsca */}
                      <col style={{ width: "120px" }} />{" "}
                      {/* Akcje - sztywne 100px dla 1-2 przycisków */}
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Miniatura</th>
                        <th>Produkt</th>
                        <th>Autor</th>
                        <th>Ocena</th>
                        <th>Treść</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th>Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentApprovedReviews.map((review) => (
                        <tr key={`approved-${review.id}`}>
                          <td className="td-img">
                            <div className="img-wrapper">
                              <img
                                src={getImageUrl(review.main_image)}
                                alt={review.product_name || "Produkt"}
                                onError={(e) => {
                                  e.target.src = defaultImg;
                                }}
                              />
                            </div>
                          </td>
                          <td className="td-main">
                            <strong>
                              {review.product_name || "Brak nazwy"}
                            </strong>
                            <span className="sub-info">
                              ID: #{review.product_id}
                            </span>
                          </td>
                          <td className="td-main">
                            <strong>{review.author_name}</strong>
                            <span className="sub-info">
                              {formatDate(review.created_at)}
                            </span>
                            {review.is_verified === 1 && (
                              <span
                                style={{
                                  color: "#16a34a",
                                  fontSize: "0.75rem",
                                  display: "block",
                                }}
                              >
                                ✓ Zweryfikowany
                              </span>
                            )}
                          </td>
                          <td>{renderStars(review.rating)}</td>
                          <td className="td-review-text">{review.comment}</td>
                          <td style={{ textAlign: "center" }}>
                            {/* ZMIANA: Zamiast tekstu, wyświetlamy czytelną ikonę z tooltipem */}
                            <CheckCircle
                              className="status-icon success"
                              size={24}
                              title="Zaakceptowana i widoczna"
                            />
                          </td>
                          <td className="td-actions">
                            <div className="actions-container">
                              <button
                                className="action-btn delete"
                                title="Usuń opinię"
                                onClick={() => openDialog("delete", review.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalApprovedPages > 1 && (
                  <div className="reviews-pagination">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalApprovedPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        variant={dialogConfig.variant}
        confirmText={dialogConfig.confirmText}
        isLoading={isProcessing}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />

      <ToastAlert
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={closeToast}
      />
    </div>
  );
}

export default AdminReviews;
