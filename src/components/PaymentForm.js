import React, { useEffect, useRef } from "react";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";

// The actual card form is rendered by payment-be itself (an iframe it serves), not by this
// component — this just embeds it and reacts to the result, the same way a merchant page
// embeds a real gateway's hosted widget (e.g. Stripe Elements) instead of building its own
// card inputs.
export default function PaymentForm({ paymentIntentId, clientSecret, onPaid }) {
  const handledRef = useRef(false);

  useEffect(() => {
    const handler = (event) => {
      if (!event.data || event.data.type !== "ecom-payment-result") return;
      if (event.data.status === "SUCCEEDED") {
        if (handledRef.current) return;
        handledRef.current = true;
        toast.success("Payment successful");
        onPaid();
      } else if (event.data.status === "FAILED") {
        toast.error(event.data.message || "Payment failed");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onPaid]);

  const widgetUrl = `${process.env.REACT_APP_PAYMENT_URL}/api/payments/intents/${paymentIntentId}/widget?clientSecret=${encodeURIComponent(
    clientSecret
  )}`;

  return (
    <Card className="mt-2">
      <Card.Body>
        <Card.Title>Complete Payment</Card.Title>
        <iframe
          src={widgetUrl}
          title="Payment"
          style={{ width: "100%", height: "420px", border: "none" }}
        />
      </Card.Body>
    </Card>
  );
}
