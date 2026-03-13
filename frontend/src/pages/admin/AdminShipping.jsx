import React, { useState, useEffect } from "react";
import { Truck, Package } from "lucide-react";
import Button from "../../components/ui/Button";
import ToastAlert from "../../components/ui/ToastAlert";
import Loader from "../../components/ui/Loader";
import { settingApi } from "../../utils/api";
import "../../styles/pages/admin/admin-shipping.scss";

function AdminShipping() {
	const [courierCost, setCourierCost] = useState("0.00");
	const [lockerCost, setLockerCost] = useState("0.00");
	const [isLoading, setIsLoading] = useState(true);

	// ZMIANA: Dynamiczny Toast obsługujący błędy i sukcesy
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
		type: "success",
	});

	useEffect(() => {
		const fetchCosts = async () => {
			try {
				const response = await settingApi.getShippingCosts();
				setCourierCost(response.data.courierCost);
				setLockerCost(response.data.lockerCost);
			} catch (error) {
				console.error("Błąd podczas pobierania kosztów wysyłki:", error);
				setToast({
					isOpen: true,
					message: "Nie udało się pobrać aktualnych kosztów.",
					type: "error",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchCosts();
	}, []);

	// --- FUNKCJA WALIDUJĄCA KOSZTY W CZASIE RZECZYWISTYM ---
	const handlePriceChange = (setter) => (e) => {
		let val = e.target.value;

		// ZMIANA: Zabezpieczenie przed wpisaniem nieskończenie długiego tekstu
		if (val.length > 7) {
			val = val.slice(0, 7);
		}

		// 1. Zamień przecinek na kropkę
		val = val.replace(/,/g, ".");

		// 2. Usuń litery, minusy (w tym 'e') - zostaw tylko cyfry i kropkę
		val = val.replace(/[^0-9.]/g, "");

		// 3. Jeśli ktoś zaczyna od kropki, dodaj zero na początku
		if (val.startsWith(".")) {
			val = "0" + val;
		}

		// 4. Zabezpieczenie przed wpisaniem kilku kropek
		const parts = val.split(".");
		if (parts.length > 2) {
			val = parts[0] + "." + parts.slice(1).join("");
		}

		// 5. Usuwanie wiodących zer
		if (/^0[0-9]/.test(val)) {
			val = val.replace(/^0+/, "");
			if (val === "") val = "0";
		}

		// 6. Ograniczenie do 2 miejsc po przecinku
		if (val.includes(".")) {
			const [intPart, decPart] = val.split(".");
			val = `${intPart}.${decPart.slice(0, 2)}`;
		}

		setter(val);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		try {
			await settingApi.updateShippingCosts({
				courierCost: parseFloat(courierCost || 0),
				lockerCost: parseFloat(lockerCost || 0),
			});
			setToast({
				isOpen: true,
				message: "Pomyślnie zaktualizowano koszty wysyłki.",
				type: "success",
			});
		} catch (error) {
			console.error("Błąd podczas zapisywania kosztów wysyłki:", error);
			// Wyłapanie wiadomości błędu z backendu lub wyświetlenie domyślnej
			const errorMessage =
				error.response?.data?.error ||
				"Wystąpił błąd podczas zapisu. Spróbuj ponownie.";
			setToast({
				isOpen: true,
				message: errorMessage,
				type: "error", // ZMIANA: Wywoła czerwony alert
			});
		}
	};

	if (isLoading) {
		return <Loader message="Pobieranie kosztów wysyłki..." />;
	}

	return (
		<div className="shipping-page">
			<header className="shipping-header">
				<h1>Koszty wysyłki</h1>
				<p>Zarządzaj cenami dostawy dla kuriera i paczkomatów</p>
			</header>

			<div className="shipping-card">
				<form className="shipping-form" onSubmit={handleSave}>
					<div className="form-group">
						<label htmlFor="courier" className="form-group__label">
							<Truck size={20} />
							Koszt kuriera (PLN)
						</label>
						<input
							type="text"
							inputMode="decimal"
							id="courier"
							className="form-group__input"
							value={courierCost}
							onChange={handlePriceChange(setCourierCost)}
							placeholder="np. 19.99"
							maxLength={7} // ZMIANA: Blokada z poziomu HTML
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="locker" className="form-group__label">
							<Package size={20} />
							Koszt paczkomatu (PLN)
						</label>
						<input
							type="text"
							inputMode="decimal"
							id="locker"
							className="form-group__input"
							value={lockerCost}
							onChange={handlePriceChange(setLockerCost)}
							placeholder="np. 14.99"
							maxLength={7} // ZMIANA: Blokada z poziomu HTML
							required
						/>
					</div>

					<div className="form-actions">
						<Button variant="primary" type="submit">
							Zapisz zmiany
						</Button>
					</div>
				</form>
			</div>

			<ToastAlert
				isOpen={toast.isOpen}
				message={toast.message}
				type={toast.type}
				onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
			/>
		</div>
	);
}

export default AdminShipping;
