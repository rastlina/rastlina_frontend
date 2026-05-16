// src/pages/ShippingPolicyPage.tsx

import { Helmet } from "react-helmet-async";
import { Truck, PackageCheck, MapPinCheck, Mail } from "lucide-react";

const ShippingPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy | Rastlina</title>

        <meta
          name="description"
          content="Read Rastlina's shipping policy including order processing, delivery timelines, packaging standards, and shipping guidelines."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container-custom max-w-5xl pt-32 md:pt-40 pb-16 md:pb-20">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-gold mb-3">
              Policies
            </p>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-5">
              Shipping Policy
            </h1>

            <p className="text-muted-foreground leading-8 text-base md:text-lg">
              At Rastlina, we ensure your plants are carefully processed,
              packaged, and delivered safely to your doorstep.
            </p>
          </div>

          {/* Order Processing */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <Truck className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Order Processing
              </h2>
            </div>

            <div className="space-y-5 text-muted-foreground leading-8">
              <p>
                At Rastlina.com, we ensure that every order is shipped within
                <strong> 3 days </strong>
                of the order date.
              </p>

              <p>
                Confirmation and updates are communicated via email at{" "}
                <strong>info.rastlina@gmail.com</strong> and through WhatsApp.
              </p>

              <p>
                If you don't receive communication, please contact our customer
                support for assistance.
              </p>
            </div>
          </section>

          {/* Logistics Partners */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <PackageCheck className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Logistics Partners
              </h2>
            </div>

            <div className="space-y-5 text-muted-foreground leading-8">
              <p>
                We have partnered with reliable delivery services such as:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  "Bluedart",
                  "Amazon",
                  "Ekart",
                  "DTDC",
                  "Delivery",
                ].map((partner) => (
                  <div
                    key={partner}
                    className="border border-border rounded-xl p-4 text-center bg-background"
                  >
                    <p className="font-medium text-primary">{partner}</p>
                  </div>
                ))}
              </div>

              <p>
                They typically take
                <strong> 5–9 days </strong>
                to deliver plants, ensuring timely and secure transportation.
              </p>
            </div>
          </section>

          {/* Packaging */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <PackageCheck className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Packaging
              </h2>
            </div>

            <div className="space-y-5 text-muted-foreground leading-8">
              <p>
                Your plants are carefully packed in sturdy, breathable packages
                to maintain optimal ventilation and natural light exposure
                during transit.
              </p>

              <p>
                This ensures your plants arrive in perfect condition and remain
                healthy throughout the delivery process.
              </p>
            </div>
          </section>

          {/* Accurate Address */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <MapPinCheck className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold text-primary">
                Accurate Shipping Address
              </h2>
            </div>

            <div className="space-y-5 text-muted-foreground leading-8">
              <p>
                Please double-check that the shipping address and PIN code
                provided when placing your order are correct.
              </p>

              <p>
                Rastlina will not be responsible for delivery issues, delays, or
                returns caused due to incorrect address details.
              </p>

              <p>
                Any additional costs for re-delivery due to address errors will
                be charged accordingly.
              </p>
            </div>
          </section>

          {/* Support */}
          <section className="bg-primary text-white rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <Mail className="h-7 w-7 text-accent-gold" />

              <h2 className="text-2xl font-semibold">
                Need Help?
              </h2>
            </div>

            <div className="space-y-4 text-white/90 leading-8">
              <p>
                If you have questions regarding your shipment or delivery,
                please contact our support team.
              </p>

              <p>
                <strong>Email:</strong> info.rastlina@gmail.com
              </p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default ShippingPolicyPage;