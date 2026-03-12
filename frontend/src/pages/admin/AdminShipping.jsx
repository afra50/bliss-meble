import React, { useState } from "react";
import { Truck, Package } from "lucide-react";
import Button from "../../components/ui/Button";
import ToastAlert from "../../components/ui/ToastAlert";
import "../../styles/pages/admin/admin-shipping.scss";

function AdminShipping() {
	const [courierCost, setCourierCost] = useState("19.99");
	const [lockerCost, setLockerCost] = useState("14.99");
	const [isToastOpen, setIsToastOpen] = useState(false);

	const handleSave = (e) => {
		e.preventDefault();
		setIsToastOpen(true);
	};

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
							type="number"
							id="courier"
							className="form-group__input"
							step="0.01"
							value={courierCost}
							onChange={(e) => setCourierCost(e.target.value)}
							placeholder="np. 19.99"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="locker" className="form-group__label">
							<Package size={20} />
							Koszt paczkomatu (PLN)
						</label>
						<input
							type="number"
							id="locker"
							className="form-group__input"
							step="0.01"
							value={lockerCost}
							onChange={(e) => setLockerCost(e.target.value)}
							placeholder="np. 14.99"
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
				isOpen={isToastOpen}
				message="Pomyślnie zaktualizowano koszty wysyłki."
				type="success"
				onClose={() => setIsToastOpen(false)}
			/>
		</div>
	);
}

export default AdminShipping;
