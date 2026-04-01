import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "../../styles/components/checkout/checkout-stepper.scss";

const CheckoutStepper = ({ currentStep }) => {
  const navigate = useNavigate();

  // Funkcja obsługująca nawigację po kliknięciu w krok
  const handleStepClick = (stepTarget) => {
    // Klient może cofnąć się tylko do wcześniejszych kroków
    if (stepTarget < currentStep) {
      if (stepTarget === 1) {
        navigate("/koszyk");
      } else if (stepTarget === 2) {
        navigate("/zamowienie/dostawa");
      }
    }
  };

  return (
    <div className="checkout-stepper">
      <div
        className={`checkout-stepper__step 
          ${currentStep >= 1 ? "checkout-stepper__step--active" : ""} 
          ${currentStep > 1 ? "checkout-stepper__step--clickable" : ""}
        `}
        onClick={() => handleStepClick(1)}
      >
        <span>1. KOSZYK</span>
      </div>

      <FaArrowRight className="checkout-stepper__arrow" />

      <div
        className={`checkout-stepper__step 
          ${currentStep >= 2 ? "checkout-stepper__step--active" : ""} 
          ${currentStep > 2 ? "checkout-stepper__step--clickable" : ""}
        `}
        onClick={() => handleStepClick(2)}
      >
        <span>2. ZAMÓWIENIE</span>
      </div>

      <FaArrowRight className="checkout-stepper__arrow" />

      <div
        className={`checkout-stepper__step 
          ${currentStep >= 3 ? "checkout-stepper__step--active" : ""}
        `}
      >
        <span>3. PODSUMOWANIE</span>
      </div>
    </div>
  );
};

export default CheckoutStepper;
