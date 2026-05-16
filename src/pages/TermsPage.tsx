// src/pages/TermsPage.tsx

import { Helmet } from "react-helmet-async";

const sections = [
  {
    title: "SECTION 1 - ONLINE STORE TERMS",
    content: [
      "By agreeing to these Terms, you represent that you are of legal age in your jurisdiction, and if allowing your minor dependents to use the site, you have given consent.",
      "You may not use our products for any illegal purpose or violate any relevant laws in your jurisdiction (including but not limited to copyright laws).",
      "Transmitting any worms or viruses or destructive code is prohibited.",
      "Violation of any Terms will result in immediate termination of services.",
    ],
  },
  {
    title: "SECTION 2 - GENERAL CONDITIONS",
    content: [
      "We reserve the right to refuse service to anyone for any reason at any time.",
      "Your content (excluding credit card info), may be transferred unencrypted over networks. Credit card information is always encrypted during transfer over networks.",
      "You agree not to reproduce any part of the Service without express written permission.",
      "The headings are for convenience only and will not affect the Terms.",
    ],
  },
  {
    title: "SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION",
    content: [
      "We are not responsible if information on this site isn't accurate or current. Material is for general use only and reliance on it is at your own risk.",
      "Historical data is provided for reference and is not current.",
      "We reserve the right to modify site content but no obligation to update information on our site.",
    ],
  },
  {
    title: "SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES",
    content: [
      "Prices for products are subject to change without notice.",
      "We reserve the right to modify or discontinue the Service or content at any time without notice.",
      "We are not liable for third-party modifications or price changes.",
    ],
  },
  {
    title: "SECTION 5 - PRODUCTS OR SERVICES (if applicable)",
    content: [
      "Certain products may only be available online. These may have limited quantities and are subject to return or exchange according to our Refund Policy.",
      "Product colours, as displayed, may not be accurate on various screens.",
      "We have the right to restrict product and service sales to any person, region, or jurisdiction on a case-by-case basis.",
      "We do not guarantee that products/services will meet expectations or errors in service will be corrected.",
    ],
  },
  {
    title: "SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION",
    content: [
      "We reserve the right to refuse or limit orders, cancel orders, and restrict quantities per account, card, or address.",
      "You agree to provide current and complete purchase information and update it promptly.",
    ],
  },
  {
    title: "SECTION 7 - OPTIONAL TOOLS",
    content: [
      "Access to third-party tools is provided “as is” and “as available” without warranties.",
      "We bear no liability for optional third-party tools.",
      "Future services/products will fall under these Terms.",
    ],
  },
  {
    title: "SECTION 8 - THIRD-PARTY LINKS",
    content: [
      "Third-party links on this site may direct you to external websites not affiliated with us.",
      "We aren’t liable for content or transactions on these external sites.",
    ],
  },
  {
    title: "SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS",
    content: [
      "If you send unsolicited submissions, such as creative suggestions, we may use them without restriction.",
    ],
  },
  {
    title: "SECTION 10 - PERSONAL INFORMATION",
    content: [
      "Your submission of personal information through the store is governed by our Privacy Policy.",
    ],
  },
  {
    title: "SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS",
    content: [
      "We reserve the right to correct errors or omissions and to cancel orders if any information is inaccurate.",
    ],
  },
  {
    title: "SECTION 12 - PROHIBITED USES",
    content: [
      "Use of the site for unlawful purposes, or in violation of regulations, laws, or these Terms, is prohibited.",
    ],
  },
  {
    title: "SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY",
    content: [
      "We do not guarantee that our Service will be uninterrupted or error-free, and your use is at your sole risk.",
    ],
  },
  {
    title: "SECTION 14 - INDEMNIFICATION",
    content: [
      "You agree to indemnify Rastlina.com and all associated parties against claims arising from your breach of these Terms.",
    ],
  },
  {
    title: "SECTION 15 - SEVERABILITY",
    content: [
      "If any provision is found unlawful, the enforceable parts still apply.",
    ],
  },
  {
    title: "SECTION 16 - TERMINATION",
    content: [
      "Terms remain in effect unless terminated by either you or us.",
      "We may terminate this agreement if you breach these Terms.",
    ],
  },
  {
    title: "SECTION 17 - ENTIRE AGREEMENT",
    content: [
      "These Terms are the entire agreement for your use of the Service.",
    ],
  },
  {
    title: "SECTION 18 - GOVERNING LAW",
    content: [
      "These Terms and any agreements for services will be governed by the laws of India.",
    ],
  },
  {
    title: "SECTION 19 - CHANGES TO TERMS OF SERVICE",
    content: [
      "You are responsible for regularly reviewing these Terms.",
      "Continued use of the website constitutes acceptance of changes.",
    ],
  },
];

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Rastlina</title>

        <meta
          name="description"
          content="Read the Terms & Conditions for using Rastlina.com and purchasing products through our platform."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container-custom max-w-5xl pt-32 md:pt-40 pb-16 md:pb-20">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-gold mb-3">
              Legal
            </p>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-5">
              Terms & Conditions
            </h1>

            <p className="text-muted-foreground leading-8 text-base md:text-lg">
              Please read these Terms & Conditions carefully before accessing or
              using the Rastlina website and services.
            </p>
          </div>

          {/* Overview */}
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10">
            <h2 className="text-2xl font-semibold text-primary mb-5">
              OVERVIEW
            </h2>

            <div className="space-y-5 text-muted-foreground leading-8">
              <p>
                This website is operated by Rastlina.com. Throughout the site,
                the terms “we”, “us”, and “our” refer to Rastlina.com.
              </p>

              <p>
                We offer this website, including all information, tools, and
                services available, conditioned upon your acceptance of all
                terms, conditions, policies, and notices set here.
              </p>

              <p>
                By visiting our site or purchasing something from us, you engage
                in our “Service” and agree to be bound by these terms and
                conditions (“Terms of Service”, “Terms”), including any
                additional terms and conditions and policies referenced here
                and/or available by hyperlink.
              </p>

              <p>
                These Terms apply to all site users, including but not limited
                to browsers, vendors, customers, merchants, and content
                contributors.
              </p>

              <p>
                Please read these Terms carefully before accessing or using our
                website. By accessing or using any part of the site, you agree
                to be bound by these Terms.
              </p>

              <p>
                If you do not agree, you may not access the website or use any
                services. Acceptance is explicitly limited to these Terms.
              </p>

              <p>
                Any new features or tools added to the current store will also
                be subject to the Terms.
              </p>

              <p>
                You can review the most current version of the Terms any time on
                this page.
              </p>

              <p>
                We reserve the right to update or change parts of these Terms by
                posting updates on our website, and it's your responsibility to
                check this page periodically.
              </p>

              <p>
                Your continued use of or access following any changes
                constitutes acceptance of those changes.
              </p>

              <p>
                Our store is hosted on Shopify Inc., which provides us the
                e-commerce platform to sell our products and services.
              </p>
            </div>
          </section>

          {/* Dynamic Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="bg-card border border-border rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-2xl font-semibold text-primary mb-5">
                  {section.title}
                </h2>

                <div className="space-y-4 text-muted-foreground leading-8">
                  {section.content.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact Information */}
          <section className="bg-primary text-white rounded-2xl p-6 md:p-8 mt-10">
            <h2 className="text-2xl font-semibold mb-5">
              SECTION 20 - CONTACT INFORMATION
            </h2>

            <div className="space-y-4 text-white/90 leading-8">
              <p>
                Questions about the Terms of Service should be sent to us at:
              </p>

              <div className="space-y-2">
                <p>
                  <strong>Address:</strong> Safari Nagar, Kondapur, Hyderabad
                  500084
                </p>

                <p>
                  <strong>Call:</strong> +91 8143814466
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default TermsPage;