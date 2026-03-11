import React from "react";
import { FaArrowRight } from "react-icons/fa";
import "../../styles/components/checkout/checkout-stepper.scss";

const CheckoutStepper = ({ currentStep }) => {
  return (
    <div className="checkout-stepper">
      <div
        className={`checkout-stepper__step ${
          currentStep >= 1 ? "checkout-stepper__step--active" : ""
        }`}
      >
        <span>1. KOSZYK</span>
      </div>

      <FaArrowRight className="checkout-stepper__arrow" />

      <div
        className={`checkout-stepper__step ${
          currentStep >= 2 ? "checkout-stepper__step--active" : ""
        }`}
      >
        <span>2. ZAMÓWIENIE</span>
      </div>

      <FaArrowRight className="checkout-stepper__arrow" />

      <div
        className={`checkout-stepper__step ${
          currentStep >= 3 ? "checkout-stepper__step--active" : ""
        }`}
      >
        <span>3. PODSUMOWANIE</span>
      </div>
    </div>
  );
};

export default CheckoutStepper;
