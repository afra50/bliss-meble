import React from "react";
import Button from "../components/ui/Button";
import { RotateCcw, Wrench, Truck, Phone } from "lucide-react";
import "../styles/pages/complaints.scss";

function Complaints() {
	return (
		<main className="complaints-page">
			<header className="complaints-header">
				<h1 className="complaints-title">Zwroty i Reklamacje</h1>
				<p className="complaints-intro">
					Zadowolenie naszych Klientów jest dla nas priorytetem. Dbamy o to, aby
					procesy zwrotów i zgłoszeń reklamacyjnych przebiegały sprawnie,
					transparentnie i w pełnej zgodności z obowiązującymi przepisami prawa.
					Poniżej znajdują się szczegółowe informacje dotyczące Twoich praw.
				</p>
			</header>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<RotateCcw size={28} />
					1. Prawo odstąpienia od umowy (Zwroty)
				</h2>
				<p className="complaints-text">
					Zgodnie z art. 27 ustawy z dnia 30 maja 2014 r. o prawach konsumenta,
					przysługuje Ci prawo do odstąpienia od umowy zawartej na odległość bez
					podawania jakiejkolwiek przyczyny.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Kogo dotyczy:</strong> Prawo to przysługuje Konsumentom oraz
						Przedsiębiorcom na prawach konsumenta (osobom fizycznym zawierającym
						umowę bezpośrednio związaną z ich działalnością gospodarczą, gdy z
						treści tej umowy wynika, że nie posiada ona dla tych osób charakteru
						zawodowego).
					</li>
					<li className="complaints-list-text">
						<strong>Termin:</strong> Czas na odstąpienie od umowy wynosi{" "}
						<strong>14 dni</strong> i jest liczony od dnia następnego po dniu, w
						którym wszedłeś w posiadanie towaru (doręczenie przesyłki).
					</li>
					<li className="complaints-list-text">
						<strong>Jak zgłosić zwrot?</strong> Aby zachować termin, wystarczy
						wysłać do nas jednoznaczne oświadczenie przed jego upływem. Możesz
						to zrobić drogą elektroniczną na adres: <strong>XXX</strong> lub
						listownie na adres: <strong>XXX</strong>. Możesz skorzystać z
						gotowego wzoru formularza odstąpienia od umowy, jednak nie jest to
						obowiązkowe.
					</li>
					<li className="complaints-list-text">
						<strong>Odesłanie towaru i koszty:</strong> Po przesłaniu
						oświadczenia masz obowiązek odesłać towar niezwłocznie, nie później
						niż w terminie 14 dni, na adres: <strong>XXX</strong>. Bezpośrednie
						koszty transportu zwracanego towaru ponosi Kupujący. Z uwagi na
						gabaryty mebli, koszt ten może być wyższy niż standardowa przesyłka
						pocztowa.
					</li>
					<li className="complaints-list-text">
						<strong>Stan zwracanego towaru:</strong> Jako Kupujący ponosisz
						odpowiedzialność za zmniejszenie wartości mebli będące wynikiem
						korzystania z nich w sposób wykraczający poza konieczny do
						stwierdzenia ich charakteru, cech i funkcjonowania. Zalecamy zwrot
						towaru w oryginalnym, bezpiecznym opakowaniu.
					</li>
					<li className="complaints-list-text">
						<strong>Kiedy prawo do zwrotu nie przysługuje?</strong> Zgodnie z
						art. 38 ustawy o prawach konsumenta, prawo odstąpienia nie
						przysługuje w przypadku umów, w których przedmiotem świadczenia jest{" "}
						<strong>rzecz nieprefabrykowana</strong>, wyprodukowana według
						specyfikacji konsumenta lub służąca zaspokojeniu jego
						zindywidualizowanych potrzeb (np. meble tapicerowane z wyborem
						niestandardowej tkaniny na indywidualne zamówienie).
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Wrench size={28} />
					2. Reklamacje (Niezgodność towaru z umową)
				</h2>
				<p className="complaints-text">
					Jako sprzedawca odpowiadamy za to, aby dostarczony towar był zgodny z
					umową. W przypadku stwierdzenia wad fabrycznych lub braków elementów,
					masz prawo złożyć reklamację na podstawie przepisów o niezgodności
					towaru z umową (rozdział 5a Ustawy o prawach konsumenta). Odpowiadamy
					za wady ujawnione w ciągu <strong>2 lat</strong> od dostarczenia
					towaru.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Czego możesz żądać?</strong> W pierwszej kolejności masz
						prawo żądać <strong>naprawy lub wymiany</strong> towaru na nowy.
						Jeżeli naprawa lub wymiana okażą się niemożliwe lub wymagałyby
						nadmiernych kosztów, możesz złożyć oświadczenie o{" "}
						<strong>obniżeniu ceny</strong> lub (w przypadku wad istotnych){" "}
						<strong>odstąpić od umowy</strong>.
					</li>
					<li className="complaints-list-text">
						<strong>Procedura zgłoszenia:</strong> Reklamację prosimy zgłaszać
						na adres e-mail: <strong>XXX</strong>. W celu maksymalnego
						przyspieszenia procesu, prosimy o załączenie w wiadomości:
						<ul className="complaints-list">
							<li className="complaints-list-text">Numeru zamówienia.</li>
							<li className="complaints-list-text">Dokładnego opisu wady.</li>
							<li className="complaints-list-text">
								Wyraźnych zdjęć uszkodzenia oraz zdjęcia całego mebla.
							</li>
							<li className="complaints-list-text">
								Symboli/numerów uszkodzonych lub brakujących elementów (zgodnie
								z załączoną instrukcją montażu).
							</li>
						</ul>
					</li>
					<li className="complaints-list-text">
						<strong>Rozpatrzenie reklamacji:</strong> Do Twojego żądania
						ustosunkujemy się niezwłocznie, nie później niż w terminie{" "}
						<strong>14 dni</strong> od daty otrzymania kompletnego zgłoszenia.
						Brak odpowiedzi w tym terminie oznacza uznanie roszczenia za
						uzasadnione. O kolejnych krokach (np. dosłaniu części, wizycie
						serwisu) poinformujemy Cię mailowo lub telefonicznie.
					</li>
					<li className="complaints-list-text">
						<strong>Koszty reklamacji:</strong> W przypadku uznanej reklamacji,
						koszty związane z naprawą, wymianą oraz ewentualnym odbiorem
						wadliwego towaru ponosi nasza firma.
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Truck size={28} />
					3. Uszkodzenia w transporcie
				</h2>
				<p className="complaints-text">
					Dokładamy wszelkich starań, aby meble były odpowiednio zabezpieczone
					na czas transportu. Prosimy jednak o szczególną uwagę podczas odbioru
					zamówienia od kuriera.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Odbiór przesyłki:</strong> Zawsze sprawdź stan zewnętrzny
						opakowania w obecności kuriera.
					</li>
					<li className="complaints-list-text">
						<strong>Widoczne uszkodzenia:</strong> Jeżeli karton jest
						zgnieciony, rozdarty lub nosi ślady uderzenia,{" "}
						<strong>bezwzględnie spisz protokół szkody z kurierem</strong> w
						momencie doręczenia. Dokument ten jest kluczowy do szybkiego
						dochodzenia roszczeń od przewoźnika.
					</li>
					<li className="complaints-list-text">
						<strong>Uszkodzenia ukryte:</strong> Jeżeli opakowanie było
						nienaruszone, a po rozpakowaniu stwierdzisz uszkodzenie elementów
						mebla, zgłoś to nam niezwłocznie – najlepiej w terminie do 7 dni od
						odbioru.
					</li>
					<li className="complaints-list-text">
						<strong>Ważna uwaga montażowa:</strong> Jeżeli zauważysz, że
						którykolwiek element jest uszkodzony,{" "}
						<strong>nie przystępuj do montażu mebla</strong>. Próba zmontowania
						uszkodzonego produktu może uniemożliwić wymianę elementu i skutkować
						odrzuceniem reklamacji przez producenta.
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Phone size={28} />
					4. Dane kontaktowe Działu Reklamacji i Zwrotów
				</h2>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>E-mail:</strong> XXX
					</li>
					<li className="complaints-list-text">
						<strong>Telefon:</strong> XXX (infolinia czynna od poniedziałku do
						piątku w godzinach XXX - XXX)
					</li>
					<li className="complaints-list-text">
						<strong>Adres do wysyłki zwrotów i korespondencji:</strong> XXX
					</li>
				</ul>
			</section>
		</main>
	);
}

export default Complaints;
