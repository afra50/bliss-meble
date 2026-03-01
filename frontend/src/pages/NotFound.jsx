import React from "react";
import Button from "../components/ui/Button";
import "../styles/pages/not-found.scss";
import Image404 from "../assets/404.jpeg";

function NotFound() {
	return (
		<main className="notfound-page">
			<div className="notfound-container">
				<div className="notfound-image-wrapper">
					<img
						src={Image404}
						alt="kanapa a nad nią obraz z cyfrą 404"
						className="nf-image"
					/>
				</div>
				<header className="notfound-hero">
					<p className="nf-error">Błąd 404</p>
					<h1 className="nf-tittle">Nie znaleźliśmy tej strony</h1>
					<p className="nf-text">
						Wygląda na to, że podany adres nie istnieje lub strona została
						przeniesiona. Możesz wrócić do strony głównej.
					</p>
					<Button className="nf-button" to="/">
						Powrót do strony głównej
					</Button>
				</header>
			</div>
		</main>
	);
}

export default NotFound;
