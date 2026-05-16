// src/pages/ReturnsRefundPolicyPage.tsx

import { Helmet } from "react-helmet-async";
import {
  RotateCcw,
  BadgeAlert,
  RefreshCcw,
  PackageSearch,
  Clock3,
} from "lucide-react";

const cancellationPolicies = [
  "Orders that have already been assigned for shipment cannot be cancelled.",
  "If your order hasn’t been shipped within 3 days from the order date, you are eligible to cancel it.",
  "Orders that are identical to previous ones are eligible for cancellation.",
  "Any orders placed by mistake can be cancelled.",
  "If you receive a different quantity than ordered, the order is eligible for cancellation. (Items not yet delivered to the customer are eligible for cancellation.)",
];

const refundPolicies = [
  "If a replacement plant arrives damaged, you can claim a refund after providing image verification of the damage.",
  "Should you receive an incorrect item, you are entitled to a refund.",
  "Missing items from your package are eligible for a refund with image or video verification.",
  "Items marked as Return to Origin (RTO) can qualify for a refund.",
  "If the courier marks your items as delivered, but you haven’t received them, you may request a refund following verification. Report discrepancies within 7 days.",
  "For planters with visible scratches or damage, refunds will be issued upon photo or video verification.",
  "If items are missing or an empty box is received, a video of the package being opened is required to process a refund.",
];

const replacementPolicies = [
  "Replacement claims are valid for up to 10 days from the date of delivery.",
  "If you receive a wrong or damaged product, please contact customer support with images for resolution.",
  "Plants are eligible for replacement only if severely damaged, such as uprooted roots, broken stems, or completely dried leaves.",
  "Plant replacements apply only to plants that are not curable.",
  "Planters/Pots are eligible for replacement only for visible cracks.",
  "Missing, undelivered parts, or incorrect quantities are eligible for reshipment or refund.",
  "Please retain the box and attached shipping label for verification purposes.",
  "For empty box or missing item claims, a package opening video is mandatory.",
  "If a replacement plant arrives damaged, provide a photo of it in the temporary pot to claim a refund.",
];

const rtoPolicies = [
  "For prepaid orders, only reshipment is allowed (no refund).",
  "Partially paid orders are eligible for reshipment only (no refund).",
  "If RTO occurs due to customer fault (wrong address, refusal, or unavailability), reshipment is possible.",
  "Refunds in customer-fault RTO cases will be processed after deducting shipping and handling charges (25-30%).",
];

const ReturnsRefundPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Returns & Refund Policy | Rastlina</title>

        <meta
          name="description"
          content="Read Rastlina's cancellation, refund, replacement, reshipment, and Return to Origin (RTO) policies."
        />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 md:pt-28">
        <div className="container-custom max-w-5xl py-16 md:py-20">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-gold mb-3">
              Policies
            </p>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-5">
              Returns & Refund Policy
            </h1>

            <p className="text-muted-foreground leading-8 text-base md:text-lg">
              Please review our cancellation, refund, replacement, and
              reshipment policies carefully before placing an order with
              Rastlina.
            </p>
          </div>

          {/* Cancellation Policy */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Cancellation Policy
              </h2>
            </div>

            <div className="space-y-4">
              {cancellationPolicies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground leading-8"
                >
                  <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Refund Policy */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BadgeAlert className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Refund Policy
              </h2>
            </div>

            <div className="space-y-4">
              {refundPolicies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground leading-8"
                >
                  <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Replacement & Re-shipment */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <RefreshCcw className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Replacement & Re-shipment Policy
              </h2>
            </div>

            <div className="space-y-4">
              {replacementPolicies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground leading-8"
                >
                  <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Timelines */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock3 className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Timelines
              </h2>
            </div>

            <div className="space-y-4 text-muted-foreground leading-8">
              <div className="flex items-start gap-3">
                <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                <p>
                  Replacement products are typically delivered within
                  <strong> 7–10 working days </strong>
                  from approval.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                <p>
                  Return requests are processed within
                  <strong> 7–10 working days </strong>
                  from the date the returned product is received.
                </p>
              </div>
            </div>
          </section>

          {/* RTO Policy */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <PackageSearch className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Return to Origin (RTO) Policy
              </h2>
            </div>

            <div className="space-y-4">
              {rtoPolicies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground leading-8"
                >
                  <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                  <p>{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-primary font-medium leading-7">
                Disclaimer: By placing an order, you agree to our RTO Policy.
              </p>
            </div>
          </section>

          {/* Important Notes */}
          <section className="bg-primary text-white rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Important Notes
            </h2>

            <div className="space-y-4 text-white/90 leading-8">
              <div className="flex items-start gap-3">
                <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                <p>
                  Plant replacements will be sent in temporary pots only.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-3 h-2 w-2 rounded-full bg-accent-gold shrink-0" />

                <p>
                  For multiple plant replacements, a separate damaged
                  replacement form must be filled out for each plant.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default ReturnsRefundPolicyPage;