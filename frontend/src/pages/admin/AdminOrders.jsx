import React, { useState, useEffect } from "react";
import { Info, X, Eye } from "lucide-react";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import CustomSelect from "../../components/ui/CustomSelect";
import { orderApi } from "../../utils/api";
import { formatPrice } from "../../utils/formatPrice";
import defaultImg from "../../assets/default-product.jpg";

import "../../styles/pages/admin/admin-orders.scss";
import "../../styles/components/admin/admin-modal.scss";

// Opcje sortowania dla panelu admina zamówień
const sortOptions = [
  { value: "domyslne", label: "Domyślne (Priorytet produkcji)" },
  { value: "najnowsze", label: "Od najnowszych" },
  { value: "najstarsze", label: "Od najstarszych" },
];

// Opcje statusów zamówienia dla CustomSelect - edycja wiersza
const statusOptions = [
  { value: "waiting_payment", label: "Oczekuje na płatność" },
  { value: "paid", label: "Opłacone" },
  { value: "in_delivery", label: "W realizacji" },
  { value: "packed", label: "Gotowe do wysyłki" },
  { value: "ready_for_pickup", label: "Gotowe do odbioru" },
  { value: "shipped", label: "Wysłane" },
  { value: "completed", label: "Zakończone" },
  { value: "cancelled", label: "Anulowane" },
];

// Opcje filtrowania po statusie nad tabelą
const filterStatusOptions = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "waiting_payment", label: "Oczekuje na płatność" },
  { value: "paid", label: "Opłacone" },
  { value: "in_delivery", label: "W realizacji" },
  { value: "packed", label: "Gotowe do wysyłki" },
  { value: "ready_for_pickup", label: "Gotowe do odbioru" },
  { value: "shipped", label: "Wysłane" }, // <-- DODANA LINIJKA
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // NOWOŚĆ: Stan dla wybranego filtra statusu
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activePage, setActivePage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);
  const itemsPerPage = 20;

  // ZMIANA: Domyślnie sortujemy po "domyslne" (priorytetach)
  const [activeSort, setActiveSort] = useState("domyslne");
  const [archiveSort, setArchiveSort] = useState("najnowsze");

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderApi.getAdminAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Błąd pobierania zamówień:", err);
      setError("Nie udało się pobrać listy zamówień.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cofanie stron paginacji przy zmianie filtrów wyszukiwania/statusów
  useEffect(() => {
    setActivePage(1);
    setArchivePage(1);
  }, [searchTerm, statusFilter, activeSort]);

  const handleRetry = () => {
    fetchOrders();
  };

  const getMappedStatus = (dbStatus) => {
    const s = String(dbStatus).toLowerCase().trim();
    if (s === "waiting_payment") return "Oczekuje na płatność";
    if (s === "paid") return "Opłacone";
    if (s === "in_delivery") return "W realizacji";
    if (s === "packed") return "Gotowe do wysyłki";
    if (s === "ready_for_pickup") return "Gotowe do odbioru";
    if (s === "shipped") return "Wysłane";
    if (s === "completed") return "Zakończone";
    if (s === "cancelled") return "Anulowane";
    return dbStatus;
  };

  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status);
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditStatus("");
  };

  const handleSaveEdit = async (orderId) => {
    try {
      await orderApi.updateStatus(orderId, editStatus);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: editStatus } : order,
        ),
      );
      setEditingOrderId(null);
    } catch (err) {
      console.error("Błąd zapisu statusu:", err);
      alert("Nie udało się zaktualizować statusu w bazie danych.");
    }
  };

  // --- NOWOŚĆ: WAGI PRIORYTETÓW DO SORTOWANIA DOMYŚLNEGO ---
  // Im mniejsza liczba (wyższa waga), tym wyżej produkt wyląduje w tabeli
  const getStatusPriority = (dbStatus) => {
    const s = String(dbStatus).toLowerCase().trim();
    switch (s) {
      case "ready_for_pickup":
        return 1; // Do wydania na już
      case "packed":
        return 2; // Do wydania kurierowi
      case "shipped":
        return 3; // W drodze do klienta
      case "in_delivery":
        return 4; // Na produkcji
      case "paid":
        return 5; // Czeka w kolejce
      case "waiting_payment":
        return 6; // Brak wpłaty
      default:
        return 7;
    }
  };

  // --- PRZEBUDOWANA LOGIKA SORTOWANIA ---
  const sortOrdersList = (ordersList, sortType) => {
    const sorted = [...ordersList];

    if (sortType === "domyslne") {
      sorted.sort((a, b) => {
        const priorityA = getStatusPriority(a.status);
        const priorityB = getStatusPriority(b.status);

        // Jeśli statusy mają inny priorytet logistyczny
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // Jeśli mają ten sam priorytet, nowsze zamówienia pokazujemy jako pierwsze
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (sortType === "najnowsze") {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortType === "najstarsze") {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return sorted;
  };

  // --- FILTROWANIE GLOBALNE (Wyszukiwarka) ---
  let processedOrders = orders.filter((o) => {
    const search = searchTerm.toLowerCase();
    return (
      o.id.toString().includes(search) ||
      o.recipient_last_name?.toLowerCase().includes(search) ||
      o.recipient_email?.toLowerCase().includes(search) ||
      o.order_token?.toLowerCase().includes(search)
    );
  });

  // --- FILTROWANIE PO STATUSIE (Tylko dla sekcji "W TRAKCIE") ---
  const activeOrdersFiltered = processedOrders.filter((o) => {
    const s = String(o.status).toLowerCase().trim();

    // ZMIANA: Z sekcji "W TRAKCIE" odrzucamy TYLKO Zakończone i Anulowane
    // ("shipped" zostaje tutaj, bo wciąż jest realizowane)
    if (["cancelled", "completed"].includes(s)) return false;

    // Jeśli wybraliśmy konkretny filtr statusu z rozwijanej listy nad tabelą
    if (statusFilter !== "all" && o.status !== statusFilter) return false;

    return true;
  });

  const activeOrders = sortOrdersList(activeOrdersFiltered, activeSort);

  // Sekcje stałe dla archiwum (TYLKO Anulowane i Zakończone)
  const failedOrders = sortOrdersList(
    processedOrders.filter(
      (o) => String(o.status).toLowerCase().trim() === "cancelled",
    ),
    "najnowsze",
  );

  const archivedOrders = sortOrdersList(
    processedOrders.filter(
      (o) => String(o.status).toLowerCase().trim() === "completed",
    ),
    archiveSort, // Sortowanie archiwum
  );

  const getStatusBadgeClass = (dbStatus) => {
    const s = String(dbStatus).toLowerCase().trim();
    if (s === "waiting_payment") return "neutral";
    if (["paid", "in_delivery", "packed", "ready_for_pickup"].includes(s))
      return "warning";
    if (["shipped", "completed"].includes(s)) return "available";
    if (s === "cancelled") return "danger";
    return "neutral";
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImg;
    if (imagePath.startsWith("http")) return imagePath;
    const apiUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${apiUrl}/uploads/products/${imagePath}`;
  };

  const renderTableContent = (
    ordersList,
    currentPage,
    setPage,
    isArchiveSection = false,
  ) => {
    if (ordersList.length === 0) {
      return (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <tbody>
              <tr>
                <td colSpan="7" className="no-results">
                  <p>Brak zamówień w tej sekcji spełniających kryteria.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    const totalPages = Math.ceil(ordersList.length / itemsPerPage);
    const paginatedOrders = ordersList.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    return (
      <>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>NUMER</th>
                <th>DATA</th>
                <th>KLIENT</th>
                <th>KWOTA</th>
                <th className="col-delivery">WYSYŁKA / PŁATNOŚĆ</th>
                <th className="col-status">STATUS</th>
                <th className="col-actions">AKCJE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const isEditing = editingOrderId === order.id;
                const mappedStatus = getMappedStatus(order.status);

                return (
                  <tr key={order.id}>
                    <td className="td-main">
                      <strong>{order.id.toString().padStart(5, "0")}</strong>
                    </td>
                    <td>
                      <span className="sub-info">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {order.recipient_first_name} {order.recipient_last_name}
                      </strong>
                      <br />
                      <small className="sub-info">
                        {order.recipient_email}
                      </small>
                    </td>
                    <td className="td-price">
                      <span>{formatPrice(order.total_brut)} zł</span>
                    </td>
                    <td>
                      <span className="method-title">
                        {order.delivery_method === "odbior"
                          ? "Odbiór osobisty"
                          : order.delivery_method === "paczkomat"
                            ? "Paczkomat InPost 24/7"
                            : "Kurier"}
                      </span>
                      <small className="method-subtitle">
                        {order.payment_method === "online"
                          ? "Płatność online (Przelewy24)"
                          : order.payment_method === "tradycyjny"
                            ? "Przelew tradycyjny"
                            : "Przy odbiorze"}
                      </small>
                    </td>

                    <td className="td-status">
                      {isEditing ? (
                        <div className="status-select-wrap">
                          <CustomSelect
                            variant="form"
                            options={statusOptions}
                            value={editStatus}
                            onChange={(opt) => setEditStatus(opt.value)}
                            menuPlacement="auto"
                            menuPortalTarget={document.body}
                          />
                        </div>
                      ) : (
                        <span
                          className={`status-badge ${getStatusBadgeClass(order.status)}`}
                        >
                          {mappedStatus}
                        </span>
                      )}
                    </td>

                    <td className="td-actions">
                      {isEditing ? (
                        <div className="actions-container actions-container--editing">
                          <Button
                            variant="primary"
                            onClick={() => handleSaveEdit(order.id)}
                            className="btn-action-save"
                          >
                            Zapisz
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelEdit}
                            className="btn-action-cancel"
                          >
                            Anuluj
                          </Button>
                        </div>
                      ) : (
                        <div className="actions-container actions-container--view">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="Szczegóły zamówienia"
                            className="btn-icon"
                          >
                            <Eye size={22} />
                          </button>
                          <Button
                            variant="secondary"
                            onClick={() => handleEditClick(order)}
                            className="btn-action-edit"
                          >
                            Edytuj
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div className="header-text">
          <h1>Zarządzanie Zamówieniami</h1>
          <p className="orders-count">
            Liczba zamówień: {orders.length} (w trakcie: {activeOrders.length})
          </p>
        </div>
      </header>

      <div>
        {isLoading ? (
          <div className="orders-loader-container">
            <Loader message="Pobieranie bazy zamówień..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : (
          <>
            {/* --- PRZEBUDOWANY RZĄD STEROWANIA (Identyczny jak w produktach) --- */}
            <div className="orders-controls">
              <div className="controls-search">
                <AdminSearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Szukaj po numerze (ID), nazwisku, e-mailu..."
                />
              </div>

              <div className="controls-filters">
                <div className="select-container">
                  <CustomSelect
                    variant="form"
                    options={filterStatusOptions}
                    value={statusFilter}
                    onChange={(selected) => setStatusFilter(selected.value)}
                  />
                </div>

                <div className="select-container">
                  <CustomSelect
                    variant="sort"
                    options={sortOptions}
                    value={activeSort}
                    onChange={(selected) => setActiveSort(selected.value)}
                  />
                </div>
              </div>
            </div>

            <section className="orders-section">
              <h2 className="orders-section__title">W TRAKCIE</h2>
              {renderTableContent(
                activeOrders,
                activePage,
                setActivePage,
                false,
              )}
            </section>

            <section className="orders-section section-margin-top">
              <div className="orders-section__header-row">
                <h2 className="orders-section__title">ARCHIWUM I ANULOWANE</h2>
                <button
                  className="archive-toggle-btn"
                  onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                >
                  {isArchiveOpen ? "Ukryj archiwum" : "Pokaż archiwum"}
                </button>
              </div>

              {isArchiveOpen && (
                <>
                  {renderTableContent(
                    [...archivedOrders, ...failedOrders],
                    archivePage,
                    setArchivePage,
                    true,
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>

      {/* --- MODAL --- */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal order-modal">
            <div className="admin-modal__header">
              <h2>Zamówienie {selectedOrder.id.toString().padStart(5, "0")}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="admin-modal__body order-modal-body">
              <div className="order-info-grid">
                <div className="order-info-box">
                  <h3>Dane odbiorcy</h3>
                  <p>
                    <strong>
                      {selectedOrder.recipient_first_name}{" "}
                      {selectedOrder.recipient_last_name}
                    </strong>
                  </p>
                  <p>
                    {selectedOrder.street}{" "}
                    {selectedOrder.apartment
                      ? `m. ${selectedOrder.apartment}`
                      : ""}
                  </p>
                  <p>
                    {selectedOrder.postal_code} {selectedOrder.city}
                  </p>
                  <br />
                  <p>
                    <strong>Telefon:</strong> {selectedOrder.recipient_phone}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {selectedOrder.recipient_email}
                  </p>
                </div>

                <div className="order-info-box">
                  <h3>Dostawa i Płatność</h3>
                  <p>
                    <strong>Metoda:</strong>{" "}
                    {selectedOrder.delivery_method === "odbior"
                      ? "Odbiór osobisty"
                      : selectedOrder.delivery_method === "paczkomat"
                        ? "Paczkomat InPost 24/7"
                        : "Kurier"}{" "}
                    {selectedOrder.paczkomat_code &&
                      `(${selectedOrder.paczkomat_code})`}
                  </p>
                  <p>
                    <strong>Koszt wysyłki:</strong>{" "}
                    {formatPrice(selectedOrder.shipping_cost)} zł
                  </p>
                  <br />
                  <p>
                    <strong>Płatność:</strong>{" "}
                    {selectedOrder.payment_method === "online"
                      ? "Płatność online (Przelewy24)"
                      : selectedOrder.payment_method === "tradycyjny"
                        ? "Przelew tradycyjny"
                        : "Przy odbiorze"}
                  </p>
                  <p className="status-paragraph">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}
                    >
                      {getMappedStatus(selectedOrder.status)}
                    </span>
                  </p>
                </div>

                <div className="order-info-box">
                  <h3>Dokument sprzedaży</h3>
                  {Number(selectedOrder.wants_invoice) === 1 ? (
                    <>
                      {selectedOrder.company_name || selectedOrder.nip ? (
                        <>
                          <p>
                            <strong>Faktura na firmę:</strong>
                          </p>
                          <p>
                            <strong>Firma:</strong>{" "}
                            {selectedOrder.company_name || "-"}
                          </p>
                          <p>
                            <strong>NIP:</strong> {selectedOrder.nip || "-"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Faktura imienna</strong>
                          </p>
                          <p className="sub-text">
                            Osoba prywatna (dane jak do wysyłki)
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    <p>Paragon imienny</p>
                  )}
                </div>

                <div className="order-info-box">
                  <h3>Uwagi klienta</h3>
                  {selectedOrder.notes ? (
                    <p className="order-notes">"{selectedOrder.notes}"</p>
                  ) : (
                    <p className="order-notes order-notes--empty">
                      Brak uwag do zamówienia.
                    </p>
                  )}
                </div>
              </div>

              <div className="order-products-section">
                <h3>Zamówione produkty</h3>
                <div className="order-products-list">
                  {selectedOrder.items &&
                    selectedOrder.items.map((item, idx) => {
                      let config = item.selected_options || item.configuration;
                      if (typeof config === "string") {
                        try {
                          config = JSON.parse(config);
                        } catch (e) {
                          config = null;
                        }
                      }

                      return (
                        <div key={idx} className="order-product-row">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="order-product-row__image"
                            onError={(e) => {
                              e.target.src = defaultImg;
                            }}
                          />
                          <div className="order-product-row__info">
                            <strong className="name">{item.name}</strong>
                            <span className="qty">
                              (Ilość: {item.quantity})
                            </span>
                            {config && Object.keys(config).length > 0 && (
                              <ul className="attributes">
                                {Object.entries(config).map(([key, val]) => (
                                  <li key={key}>
                                    - {key}: <strong>{val}</strong>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="order-product-row__price">
                            {formatPrice(
                              item.price_brut_snapshot * item.quantity,
                            )}{" "}
                            zł
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="admin-modal__footer">
              <div className="modal-footer-summary">
                <span className="modal-footer-summary__label">
                  Łączna kwota zamówienia:
                </span>
                <strong className="modal-footer-summary__amount">
                  {formatPrice(selectedOrder.total_brut)} zł
                </strong>
              </div>
              <Button
                variant="outline-olive"
                onClick={() => setSelectedOrder(null)}
              >
                Zamknij okno
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
