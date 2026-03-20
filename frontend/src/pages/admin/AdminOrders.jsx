import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import CustomSelect from "../../components/ui/CustomSelect";
import "../../styles/pages/admin/admin-orders.scss";

// --- MOCKI DANYCH ---
const INITIAL_MOCK_ORDERS = [
	{
		id: 1,
		orderNumber: "BLISS-2026-000004",
		date: "11.03.2026, 17:52:03",
		total: "1450,00 zł",
		delivery: "Paczkomaty InPost 24/7",
		paymentMethod: "Płatność online (Przelewy24)",
		paymentStatus: "Opłacone",
		status: "Wysłane",
	},
	{
		id: 2,
		orderNumber: "BLISS-2026-000003",
		date: "10.03.2026, 10:13:38",
		total: "3200,00 zł",
		delivery: "Odbiór osobisty",
		paymentMethod: "Gotówka przy odbiorze",
		paymentStatus: "Oczekuje",
		status: "Oczekuje na płatność",
	},
	{
		id: 3,
		orderNumber: "BLISS-2026-000002",
		date: "09.03.2026, 09:36:11",
		total: "850,00 zł",
		delivery: "Paczkomaty InPost 24/7",
		paymentMethod: "Płatność online (Przelewy24)",
		paymentStatus: "Opłacone",
		status: "Gotowe do wysyłki",
	},
	{
		id: 4,
		orderNumber: "BLISS-2026-000005",
		date: "08.03.2026, 14:20:00",
		total: "410,00 zł",
		delivery: "Kurier",
		paymentMethod: "Płatność online (Przelewy24)",
		paymentStatus: "Nieudana",
		status: "Nieudane",
	},
	{
		id: 5,
		orderNumber: "BLISS-2026-000001",
		date: "28.02.2026, 00:34:58",
		total: "1250,00 zł",
		delivery: "Paczkomaty InPost 24/7",
		paymentMethod: "Płatność online (Przelewy24)",
		paymentStatus: "Opłacone",
		status: "Odebrane",
	},
];

// --- OPCJE SORTOWANIA ---
const sortOptions = [
	{ value: "najnowsze", label: "Od najnowszych" },
	{ value: "najstarsze", label: "Od najstarszych" },
	{ value: "status_platnosci", label: "Po statusie płatności" },
];

function AdminOrders() {
	const [orders, setOrders] = useState(INITIAL_MOCK_ORDERS);
	const [isArchiveOpen, setIsArchiveOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	// Stany do obsługi ładowania i błędów
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Stany do paginacji
	const [activePage, setActivePage] = useState(1);
	const [failedPage, setFailedPage] = useState(1);
	const [archivePage, setArchivePage] = useState(1);

	// Stany do sortowania dla sekcji
	const [activeSort, setActiveSort] = useState("najnowsze");
	const [failedSort, setFailedSort] = useState("najnowsze");
	const [archiveSort, setArchiveSort] = useState("najnowsze");

	// Stany do edycji wiersza
	const [editingOrderId, setEditingOrderId] = useState(null);
	const [editForm, setEditForm] = useState({ paymentStatus: "", status: "" });

	// Symulacja pobierania danych
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 800);
		return () => clearTimeout(timer);
	}, []);

	const handleRetry = () => {
		setError(null);
		setIsLoading(true);
		setTimeout(() => setIsLoading(false), 800);
	};

	// --- LOGIKA EDYCJI ---
	const handleEditClick = (order) => {
		setEditingOrderId(order.id);
		setEditForm({ paymentStatus: order.paymentStatus, status: order.status });
	};

	const handleCancelEdit = () => {
		setEditingOrderId(null);
		setEditForm({ paymentStatus: "", status: "" });
	};

	const handleSaveEdit = (orderId) => {
		setOrders((prevOrders) =>
			prevOrders.map((order) =>
				order.id === orderId
					? {
							...order,
							paymentStatus: editForm.paymentStatus,
							status: editForm.status,
						}
					: order,
			),
		);
		setEditingOrderId(null);
	};

	// --- LOGIKA SORTOWANIA ---
	const sortOrders = (ordersList, sortType) => {
		const sorted = [...ordersList];
		if (sortType === "najnowsze") {
			sorted.sort((a, b) => a.id - b.id);
		} else if (sortType === "najstarsze") {
			sorted.sort((a, b) => b.id - a.id);
		} else if (sortType === "status_platnosci") {
			sorted.sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
		}
		return sorted;
	};

	// --- FILTROWANIE I SORTOWANIE MOCKÓW ---
	const filteredOrders = orders.filter((o) =>
		o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const activeOrders = sortOrders(
		filteredOrders.filter(
			(o) => o.status !== "Nieudane" && o.status !== "Odebrane",
		),
		activeSort,
	);
	const failedOrders = sortOrders(
		filteredOrders.filter((o) => o.status === "Nieudane"),
		failedSort,
	);
	const archivedOrders = sortOrders(
		filteredOrders.filter((o) => o.status === "Odebrane"),
		archiveSort,
	);

	// --- MAPOWANIE STATUSÓW NA KOLORY BADGE ---
	const getStatusBadgeClass = (status) => {
		if (
			["Opłacone", "Wysłane", "Gotowe do odbioru", "Odebrane"].includes(status)
		)
			return "success";
		if (
			["Oczekuje na płatność", "Gotowe do wysyłki", "Oczekuje"].includes(status)
		)
			return "warning";
		if (["Nieudane", "Nieudana"].includes(status)) return "danger";
		return "warning";
	};

	// --- WSPÓLNY RENDERER TABELI ---
	const renderTableContent = (ordersList) => {
		// Sztywne szerokości kolumn wymuszone dla wszystkich tabel
		const colGroup = (
			<colgroup>
				<col style={{ width: "15%" }} />
				<col style={{ width: "12%" }} />
				<col style={{ width: "10%" }} />
				<col style={{ width: "15%" }} />
				<col style={{ width: "18%" }} />
				<col style={{ width: "10%" }} />
				<col style={{ width: "12%" }} />
				<col style={{ width: "8%" }} />
			</colgroup>
		);

		if (ordersList.length === 0) {
			return (
				<>
					{colGroup}
					<tbody>
						<tr>
							<td colSpan="8" className="no-results">
								<p>Brak zamówień w tej sekcji.</p>
							</td>
						</tr>
					</tbody>
				</>
			);
		}

		return (
			<>
				{colGroup}
				<thead>
					<tr>
						<th>NUMER</th>
						<th>DATA</th>
						<th>KWOTA</th>
						<th>WYSYŁKA</th>
						<th>PŁATNOŚĆ</th>
						<th>STATUS PŁATNOŚCI</th>
						<th>STATUS ZAMÓWIENIA</th>
						<th>AKCJE</th>
					</tr>
				</thead>
				<tbody>
					{ordersList.map((order) => {
						const isEditing = editingOrderId === order.id;

						return (
							<tr key={order.id}>
								<td className="td-main">
									<strong>{order.orderNumber}</strong>
								</td>
								<td>
									<span className="sub-info">{order.date}</span>
								</td>
								<td>
									<strong>{order.total}</strong>
								</td>
								<td>{order.delivery}</td>
								<td>{order.paymentMethod}</td>

								{/* KOLUMNA: STATUS PŁATNOŚCI */}
								<td>
									{isEditing ? (
										<select
											value={editForm.paymentStatus}
											onChange={(e) =>
												setEditForm({
													...editForm,
													paymentStatus: e.target.value,
												})
											}
											style={{
												width: "100%",
												padding: "6px",
												borderRadius: "4px",
												border: "1px solid #ede1d1",
												fontSize: "0.85rem",
												color: "#1d1d1b",
											}}>
											<option value="Opłacone">Opłacone</option>
											<option value="Oczekuje">Oczekuje</option>
											<option value="Nieudana">Nieudana</option>
										</select>
									) : (
										<span
											className={`status-badge ${getStatusBadgeClass(order.paymentStatus)}`}>
											{order.paymentStatus}
										</span>
									)}
								</td>

								{/* KOLUMNA: STATUS ZAMÓWIENIA */}
								<td>
									{isEditing ? (
										<select
											value={editForm.status}
											onChange={(e) =>
												setEditForm({ ...editForm, status: e.target.value })
											}
											style={{
												width: "100%",
												padding: "6px",
												borderRadius: "4px",
												border: "1px solid #ede1d1",
												fontSize: "0.85rem",
												color: "#1d1d1b",
											}}>
											<option value="Oczekuje na płatność">
												Oczekuje na płatność
											</option>
											<option value="Gotowe do wysyłki">
												Gotowe do wysyłki
											</option>
											<option value="Wysłane">Wysłane</option>
											<option value="Odebrane">Odebrane</option>
											<option value="Nieudane">Nieudane</option>
										</select>
									) : (
										<span
											className={`status-badge ${getStatusBadgeClass(order.status)}`}>
											{order.status}
										</span>
									)}
								</td>

								{/* KOLUMNA: AKCJE */}
								<td className="td-actions">
									{isEditing ? (
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "5px",
												minWidth: "80px",
											}}>
											<Button
												variant="primary"
												onClick={() => handleSaveEdit(order.id)}
												style={{ padding: "6px", fontSize: "0.85rem" }}>
												Zapisz
											</Button>
											<Button
												variant="secondary"
												onClick={handleCancelEdit}
												style={{
													padding: "6px",
													fontSize: "0.85rem",
													background: "#f5f5f5",
													color: "#1d1d1b",
												}}>
												Anuluj
											</Button>
										</div>
									) : (
										<div className="actions-container">
											<Button
												variant="primary"
												onClick={() => handleEditClick(order)}>
												Edytuj
											</Button>
										</div>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</>
		);
	};

	return (
		<div className="orders-page">
			<header className="orders-header">
				<h1>Zarządzanie Zamówieniami</h1>
				<p className="orders-count">
					Liczba zamówień: {orders.length} (w trakcie: {activeOrders.length})
				</p>
			</header>

			<div className="orders-card">
				{isLoading ? (
					<div
						style={{
							padding: "4rem 0",
							display: "flex",
							justifyContent: "center",
						}}>
						<Loader message="Ładowanie zamówień..." />
					</div>
				) : error ? (
					<ErrorState message={error} onRetry={handleRetry} />
				) : (
					<>
						{/* WYSZUKIWARKA */}
						<div style={{ marginBottom: "2rem" }}>
							<AdminSearchBar
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Szukaj po numerze zamówienia..."
							/>
						</div>

						{/* SEKCJA: W TRAKCIE */}
						<section className="orders-section">
							<h2 className="orders-section__title">W TRAKCIE</h2>
							<div className="info-box">
								<Info size={18} className="info-box__icon" />
								<span>
									Zamówienia opłacone lub oczekujące na opłacenie, w drodze lub
									jeszcze nieodebrane.
								</span>
							</div>

							<div
								className="orders-filters"
								style={{ marginBottom: "1.5rem" }}>
								<span className="orders-filters__label">
									Filtruj statusy zamówień:
								</span>
								<label className="custom-checkbox">
									<input type="checkbox" defaultChecked />
									<span>Oczekuje na płatność</span>
								</label>
								<label className="custom-checkbox">
									<input type="checkbox" defaultChecked />
									<span>Opłacone</span>
								</label>
								<label className="custom-checkbox">
									<input type="checkbox" defaultChecked />
									<span>Gotowe do wysyłki</span>
								</label>
								<label className="custom-checkbox">
									<input type="checkbox" defaultChecked />
									<span>Wysłane</span>
								</label>
								<label className="custom-checkbox">
									<input type="checkbox" defaultChecked />
									<span>Gotowe do odbioru</span>
								</label>
							</div>

							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									marginBottom: "1rem",
								}}>
								<span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
									Sortuj:
								</span>
								<div style={{ width: "200px" }}>
									<CustomSelect
										options={sortOptions}
										value={activeSort}
										onChange={(option) => setActiveSort(option.value)}
										placeholder="Wybierz..."
									/>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "1.5rem",
								}}>
								<div className="admin-table-wrapper">
									<table className="admin-table">
										{renderTableContent(activeOrders)}
									</table>
								</div>
								<Pagination
									currentPage={activePage}
									totalPages={activeOrders.length > 0 ? 1 : 0}
									onPageChange={setActivePage}
								/>
							</div>
						</section>

						<hr className="orders-divider" />

						{/* SEKCJA: NIEUDANE */}
						<section className="orders-section">
							<h2 className="orders-section__title">NIEUDANE</h2>
							<div className="info-box">
								<Info size={18} className="info-box__icon" />
								<span>
									Zamówienia anulowane lub z nieudaną płatnością przez bramkę.
								</span>
							</div>

							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									marginBottom: "1rem",
								}}>
								<span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
									Sortuj:
								</span>
								<div style={{ width: "200px" }}>
									<CustomSelect
										options={sortOptions}
										value={failedSort}
										onChange={(option) => setFailedSort(option.value)}
										placeholder="Wybierz..."
									/>
								</div>
							</div>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "1.5rem",
								}}>
								<div className="admin-table-wrapper">
									<table className="admin-table">
										{renderTableContent(failedOrders)}
									</table>
								</div>
								<Pagination
									currentPage={failedPage}
									totalPages={failedOrders.length > 0 ? 1 : 0}
									onPageChange={setFailedPage}
								/>
							</div>
						</section>

						<hr className="orders-divider" />

						{/* SEKCJA: ARCHIWUM */}
						<section className="orders-section">
							<div className="orders-section__header-row">
								<h2 className="orders-section__title">ARCHIWUM</h2>
								<button
									className="archive-toggle-btn"
									onClick={() => setIsArchiveOpen(!isArchiveOpen)}>
									{isArchiveOpen ? "Ukryj" : "Pokaż"}
								</button>
							</div>

							{isArchiveOpen && (
								<>
									<div className="info-box">
										<Info size={18} className="info-box__icon" />
										<span>
											Zamówienia zrealizowane i dostarczone lub odebrane przez
											klienta.
										</span>
									</div>

									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "10px",
											marginBottom: "1rem",
										}}>
										<span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
											Sortuj:
										</span>
										<div style={{ width: "200px" }}>
											<CustomSelect
												options={sortOptions}
												value={archiveSort}
												onChange={(option) => setArchiveSort(option.value)}
												placeholder="Wybierz..."
											/>
										</div>
									</div>

									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "1.5rem",
										}}>
										<div className="admin-table-wrapper">
											<table className="admin-table">
												{renderTableContent(archivedOrders)}
											</table>
										</div>
										<Pagination
											currentPage={archivePage}
											totalPages={archivedOrders.length > 0 ? 1 : 0}
											onPageChange={setArchivePage}
										/>
									</div>
								</>
							)}
						</section>
					</>
				)}
			</div>
		</div>
	);
}

export default AdminOrders;
