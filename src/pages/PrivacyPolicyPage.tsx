// src/pages/PrivacyPolicyPage.tsx

import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Rastlina</title>
        <meta
          name="description"
          content="Read the Privacy Policy of Rastlina regarding data collection, cookies, GDPR rights, CCPA rights, and user privacy."
        />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 md:pt-28">
        <div className="container-custom max-w-5xl py-16 md:py-20">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-gold mb-3">
              Legal
            </p>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-4">
              Privacy Policy
            </h1>

            <p className="text-muted-foreground leading-7 text-base md:text-lg">
              At Rastlina, we value your privacy and are committed to protecting
              your personal information and ensuring transparency in how data is collected and used.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-muted-foreground leading-8 text-[15px] md:text-base">

            {/* Intro */}
            <section className="space-y-5">
              <p>
                At Rastlina, accessible from www.rastlina.com, we prioritize your
                privacy and strive to keep your information secure.
              </p>

              <p>
                Our Privacy Policy outlines the types of data we gather and how
                it's utilized to enhance your experience with us.
              </p>

              <p>
                If you have any questions or want more information about our
                practices, feel free to reach out.
              </p>

              <p>
                Our Privacy Policy is strictly for our online activities,
                applying to visitors who share or provide their data at
                Rastlina. This policy doesn't cover information collected
                offline or through non-website channels.
              </p>
            </section>

            {/* Consent */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Consent
              </h2>

              <p>
                By using our website, you consent to our Privacy Policy and
                agree to its terms.
              </p>
            </section>

            {/* Information We Gather */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Information We Gather
              </h2>

              <div className="space-y-4">
                <p>
                  The personal information you provide and its purpose will be
                  clear at the time we request it.
                </p>

                <p>
                  If you communicate with us directly, we may collect additional
                  information such as your name, email, phone number, message
                  content, and any attachments you share.
                </p>

                <p>
                  When creating an account, you'll be asked for contact
                  information like name, company name, address, email, and
                  phone number.
                </p>
              </div>
            </section>

            {/* How We Use */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-5">
                How We Use Your Information
              </h2>

              <p className="mb-5">
                We utilize the information we collect for various purposes,
                including:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Operating and maintaining our website</li>
                <li>
                  Enhancing user experience and expanding our website
                </li>
                <li>
                  Analyzing website use and user interaction
                </li>
                <li>
                  Developing new features and services
                </li>
                <li>
                  Communicating with you for customer service, updates, and promotional purposes
                </li>
                <li>Sending emails and preventing fraud</li>
              </ul>
            </section>

            {/* Log Files */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Log Files
              </h2>

              <p>
                Rastlina uses log files to efficiently log visitors. This data
                includes IP addresses, browser type, Internet Service Provider
                (ISP), date and time stamps, referring/exit pages, and click
                counts, aiding trend analysis and website administration
                without personal identification.
              </p>
            </section>

            {/* Cookies */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Cookies and Web Beacons
              </h2>

              <p>
                Rastlina uses 'cookies' to store visitor preferences and track
                accessed pages, optimizing user experience through customized
                web content based on browsing behaviour and preferences.
              </p>
            </section>

            {/* Advertising */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Advertising Partners Privacy Policies
              </h2>

              <div className="space-y-4">
                <p>
                  Review our advertising partners' Privacy Policies for further
                  details.
                </p>

                <p>
                  Third-party ad networks use technologies like cookies and
                  JavaScript for advertisements and measuring their effectiveness.
                </p>

                <p>
                  Note that Rastlina has no control over cookies used by
                  third-party advertisers.
                </p>
              </div>
            </section>

            {/* Third Party */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Third Party Privacy Policies
              </h2>

              <div className="space-y-4">
                <p>
                  Rastlina's Privacy Policy doesn't cover external advertisers
                  or websites.
                </p>

                <p>
                  We recommend consulting their Privacy Policies for
                  comprehensive information and opt-out options.
                </p>

                <p>
                  You can manage cookies via browser settings. More details are
                  available on specific browser websites.
                </p>
              </div>
            </section>

            {/* CCPA */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-5">
                CCPA Privacy Rights (Do Not Sell My Personal Information)
              </h2>

              <p className="mb-5">
                Under the CCPA, California consumers can:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>
                  Request disclosure of collected personal data categories and specifics.
                </li>

                <li>
                  Request deletion of personal data.
                </li>

                <li>
                  Request that businesses don't sell consumer data.
                </li>
              </ul>

              <p className="mt-5">
                Contact us to exercise these rights, and expect a response
                within one month.
              </p>
            </section>

            {/* GDPR */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-5">
                GDPR Data Protection Rights
              </h2>

              <p className="mb-5">
                Every user is entitled to the following rights:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>
                  <strong>Access –</strong> Request copies of your personal data.
                </li>

                <li>
                  <strong>Rectification –</strong> Request correction of inaccurate or incomplete data.
                </li>

                <li>
                  <strong>Erasure –</strong> Request deletion of your personal data under certain conditions.
                </li>

                <li>
                  <strong>Restrict Processing –</strong> Request limited data processing under certain conditions.
                </li>

                <li>
                  <strong>Object –</strong> Object to personal data processing under certain conditions.
                </li>

                <li>
                  <strong>Data Portability –</strong> Request data transfer to another organization or yourself.
                </li>
              </ul>

              <p className="mt-5">
                Contact us to exercise these rights, with a response time of
                one month.
              </p>
            </section>

            {/* Children */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Children's Information
              </h2>

              <div className="space-y-4">
                <p>
                  Protecting children's privacy online is crucial. We encourage
                  parental involvement in online activities.
                </p>

                <p>
                  Rastlina doesn't knowingly collect personal information from
                  children under 13. If such data is detected, contact us to
                  ensure its prompt deletion.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;