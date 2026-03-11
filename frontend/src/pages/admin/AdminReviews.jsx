import React, { useState } from "react";
import { Trash2, Check, Star } from "lucide-react";
import "../../styles/pages/admin/admin-reviews.scss";

import AdminSearchBar from "../../components/admin/AdminSearchBar";
import CustomSelect from "../../components/ui/CustomSelect";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ToastAlert from "../../components/ui/ToastAlert";

function AdminReviews() {
	const [searchQuery, setSearchQuery] = useState("");
	const [ratingFilter, setRatingFilter] = useState({
		value: "all",
		label: "Wszystkie oceny",
	});
	const [sortFilter, setSortFilter] = useState({
		value: "newest",
		label: "Od najnowszych",
	});

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

	// --- STAN DLA TOASTA ---
	const [toastConfig, setToastConfig] = useState({
		isOpen: false,
		message: "",
		type: "success",
	});

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

	const handleConfirm = () => {
		setIsProcessing(true);
		// Symulacja akcji API
		setTimeout(() => {
			setIsProcessing(false);
			closeDialog();

			// --- WYŚWIETLANIE TOASTA PO ZAKOŃCZONEJ AKCJI ---
			if (dialogConfig.action === "delete") {
				setToastConfig({
					isOpen: true,
					message: "Recenzja została pomyślnie usunięta.",
					type: "success",
				});
			} else if (dialogConfig.action === "accept") {
				setToastConfig({
					isOpen: true,
					message: "Recenzja została zaakceptowana i jest widoczna w sklepie.",
					type: "success",
				});
			}
		}, 1000);
	};

	const ratingOptions = [
		{ value: "all", label: "Wszystkie oceny" },
		{ value: "5", label: "5 gwiazdek" },
		{ value: "4", label: "4 gwiazdki" },
		{ value: "1", label: "1 gwiazdka" },
	];

	const sortOptions = [
		{ value: "newest", label: "Od najnowszych" },
		{ value: "oldest", label: "Od najstarszych" },
	];

	return (
		<div className="reviews-page">
			<header className="reviews-header">
				<div className="reviews-title">
					<h1>Zarządzanie Recenzjami</h1>
					<p className="sub-info">Liczba recenzji: 12 (oczekujących: 2)</p>
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

			<section className="reviews-section">
				<h2 className="reviews-title">Oczekujące na akceptację</h2>
				<div className="reviews-table-wrapper">
					<table className="reviews-table">
						<colgroup>
							<col style={{ width: "120px" }} />
							<col style={{ width: "22%" }} />
							<col style={{ width: "18%" }} />
							<col style={{ width: "12%" }} />
							<col style={{ width: "25%" }} />
							<col style={{ width: "13%" }} />
							<col style={{ width: "10%" }} />
						</colgroup>
						<thead>
							<tr>
								<th>Miniatura</th>
								<th>Produkt</th>
								<th>Autor</th>
								<th>Ocena</th>
								<th>Treść</th>
								<th>Status</th>
								<th>Akcje</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="td-img">
									<img src="https://placehold.co/60x60" alt="Produkt" />
								</td>
								<td className="td-main">
									<strong>Fotel Wypoczynkowy Lumina</strong>
									<span className="sub-info">ID: #19</span>
								</td>
								<td className="td-main">
									<strong>Jan Kowalski</strong>
									<span className="sub-info">10.03.2026</span>
								</td>
								<td>
									<div className="rating-stars">
										{[...Array(4)].map((_, i) => (
											<Star key={i} size={16} fill="#eab308" color="#eab308" />
										))}
										<Star size={16} color="#eab308" />
									</div>
								</td>
								<td className="td-review-text">
									Bardzo wygodny fotel, materiał solidny. Polecam.
								</td>
								<td>
									<span className="status-badge pending">Oczekująca</span>
								</td>
								<td className="td-actions">
									<div className="actions-container">
										<button
											className="action-btn accept"
											onClick={() => openDialog("accept", 19)}>
											<Check size={16} />
										</button>
										<button
											className="action-btn delete"
											onClick={() => openDialog("delete", 19)}>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className="reviews-section">
				<h2 className="reviews-title">Zaakceptowane recenzje</h2>
				<div className="reviews-table-wrapper">
					<table className="reviews-table">
						<colgroup>
							<col style={{ width: "120px" }} />
							<col style={{ width: "22%" }} />
							<col style={{ width: "18%" }} />
							<col style={{ width: "12%" }} />
							<col style={{ width: "25%" }} />
							<col style={{ width: "13%" }} />
							<col style={{ width: "10%" }} />
						</colgroup>
						<thead>
							<tr>
								<th>Miniatura</th>
								<th>Produkt</th>
								<th>Autor</th>
								<th>Ocena</th>
								<th>Treść</th>
								<th>Status</th>
								<th>Akcje</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="td-img">
									<img src="https://placehold.co/60x60" alt="Produkt" />
								</td>
								<td className="td-main">
									<strong>Sofa Copenhagen</strong>
									<span className="sub-info">ID: #45</span>
								</td>
								<td className="td-main">
									<strong>Anna Nowak</strong>
									<span className="sub-info">05.03.2026</span>
								</td>
								<td>
									<div className="rating-stars">
										{[...Array(5)].map((_, i) => (
											<Star key={i} size={16} fill="#eab308" color="#eab308" />
										))}
									</div>
								</td>
								<td className="td-review-text">
									Kanapa jest przepiękna i idealnie pasuje do salonu.
								</td>
								<td>
									<span className="status-badge success">Zaakceptowana</span>
								</td>
								<td className="td-actions">
									<div className="actions-container">
										<button
											className="action-btn delete"
											onClick={() => openDialog("delete", 45)}>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

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
