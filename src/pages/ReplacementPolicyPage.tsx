// src/pages/ReplacementPolicyPage.tsx

const ReplacementPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 pt-24 md:pt-28">
      {/* Hero Section */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Replacement & Re-shipment Policy
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
            At Rastlina, we strive to deliver healthy plants and quality
            products. If you receive damaged, incorrect, or incomplete items,
            we are here to help with replacements, reshipments, or refunds
            wherever applicable.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Eligibility */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Replacement Eligibility
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <ul className="space-y-4 list-disc pl-6 text-gray-700 leading-relaxed">
              <li>
                Replacement claims are valid for up to{" "}
                <strong>10 days from the date of delivery</strong>.
              </li>

              <li>
                If you receive a wrong or damaged product, please contact our
                customer support team with proper image proof for quick
                resolution.
              </li>

              <li>
                Plants are eligible for replacement only if they are severely
                damaged, including:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Uprooted roots</li>
                  <li>Broken stems</li>
                  <li>Completely dried leaves</li>
                </ul>
              </li>

              <li>
                Replacement is applicable only for plants that are{" "}
                <strong>not curable</strong>.
              </li>

              <li>
                Planters and pots are eligible for replacement only in case of{" "}
                <strong>visible cracks or major physical damage</strong>.
              </li>

              <li>
                Missing products, incorrect quantities, or undelivered parts are
                eligible for reshipment or refund.
              </li>

              <li>
                Please retain the original packaging box and attached shipping
                label for verification purposes.
              </li>
            </ul>
          </div>
        </section>

        {/* Empty Box Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Empty Box / Missing Item Policy
          </h2>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              In cases where customers receive an empty package or missing
              products, proper unboxing proof is mandatory.
            </p>

            <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
              <li>
                A complete <strong>video of the package opening</strong> is
                required to process any reshipment or refund request.
              </li>

              <li>
                Claims without proper video evidence may not qualify for
                replacement approval.
              </li>

              <li>
                The shipping label must be clearly visible in the unboxing
                video.
              </li>
            </ul>
          </div>
        </section>

        {/* Damaged Replacement Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Damaged Replacement Products
          </h2>

          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
            <p className="text-gray-700 leading-relaxed">
              If a replacement plant also arrives damaged, customers may request
              a refund by submitting a clear photo of the damaged plant in its
              temporary pot for verification.
            </p>
          </div>
        </section>

        {/* Timelines */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Replacement & Return Timelines
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                Replacement Delivery
              </h3>

              <p className="text-gray-700 leading-relaxed">
                Approved replacement products are generally delivered within{" "}
                <strong>7–10 working days</strong>.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                Return Processing
              </h3>

              <p className="text-gray-700 leading-relaxed">
                Return requests are processed within{" "}
                <strong>7–10 working days</strong> after receiving the returned
                product.
              </p>
            </div>
          </div>
        </section>

        {/* RTO Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Return to Origin (RTO) Policy
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <ul className="space-y-4 list-disc pl-6 text-gray-700 leading-relaxed">
              <li>
                For prepaid orders, only reshipment is allowed. Refunds are not
                applicable.
              </li>

              <li>
                Partially paid orders are also eligible only for reshipment.
              </li>

              <li>
                If the RTO occurs because of customer-related issues such as:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Incorrect shipping address</li>
                  <li>Customer unavailable during delivery</li>
                  <li>Order refusal</li>
                </ul>
              </li>

              <li>
                Customers may request reshipment after additional shipping
                charges if applicable.
              </li>

              <li>
                Refunds requested for customer-fault RTO cases will be processed
                only after deducting{" "}
                <strong>25%–30% shipping and handling charges</strong>.
              </li>
            </ul>

            <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-xl p-4">
              <p className="text-sm text-yellow-900 font-medium">
                Disclaimer: By placing an order on Rastlina, you agree to our
                Return to Origin (RTO) Policy.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Important Notes
          </h2>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
              <li>
                Replacement plants are shipped only in temporary nursery pots.
              </li>

              <li>
                For multiple damaged plants, customers must submit separate
                replacement requests for each product.
              </li>

              <li>
                All claims are subject to verification by the Rastlina support
                team.
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-green-700 text-white rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Need Help With a Replacement?
          </h2>

          <p className="text-green-100 leading-relaxed mb-6">
            If you received a damaged or incorrect product, please contact our
            support team with your order details, images, or unboxing video for
            faster assistance.
          </p>

          <div className="space-y-2 text-green-50">
            <p>
              <strong>Email:</strong> info.rastlina@gmail.com
            </p>

            <p>
              <strong>Phone:</strong> +91 8143814466
            </p>

            <p>
              <strong>Address:</strong> Safari Nagar, Kondapur, Hyderabad
              500084
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReplacementPolicyPage;