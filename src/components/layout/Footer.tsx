import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
} from 'lucide-react';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact Us', href: '/bulk' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Shipping Policy', href: '/shipping-policy' },
  { label: 'Returns & Refunds', href: '/returns-refund-policy' },
  { label: 'Replacement Policy', href: '/replacement-policy' },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t border-white/10 pt-12 pb-6">
      <div className="container-custom">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 mb-12">

          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <div className="bg-white p-2.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] transition-transform">
                <img
                  src="/logo.png"
                  alt="Rastlina Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-sm text-white/75 leading-relaxed max-w-sm">
              Rooted in confidence, growing with you. Premium plants and green
              essentials crafted to elevate your living spaces.
            </p>

            {/* Social */}
            {/* Social */}
<div className="flex items-center gap-3 pt-1">

  {/* Instagram */}
  <a
  href="https://www.instagram.com/rastlina_naturehub/"
  target="_blank"
  rel="noopener noreferrer"
  className="p-2.5 rounded-full bg-white/10 hover:bg-accent-gold transition-colors"
  aria-label="Instagram"
>
  <Instagram className="h-4 w-4" />
</a>

<a
  href="https://www.facebook.com/profile.php?id=61590309719114"
  target="_blank"
  rel="noopener noreferrer"
  className="p-2.5 rounded-full bg-white/10 hover:bg-accent-gold transition-colors"
  aria-label="Facebook"
>
  <Facebook className="h-4 w-4" />
</a>

  {/* X / Twitter Placeholder */}
  <a
    href="#"
    className="p-2.5 rounded-full bg-white/10 hover:bg-accent-gold transition-colors opacity-70"
    aria-label="X"
  >
    <Twitter className="h-4 w-4" />
  </a>

</div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-5">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-accent-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-5">
              Get in Touch
            </h4>

            <ul className="space-y-4 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
                <span>
                  4th Floor, Lake View Towers,
                  <br />
                  Safari Nagar, Kondapur,
                  <br />
                  Hyderabad, 500084
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent-gold shrink-0" />
                <a
                  href="tel:+919915473575"
                  className="hover:text-accent-gold transition-colors"
                >
                  +91 8143814466 
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent-gold shrink-0" />
                <a
                  href="mailto:info.rastlina@gmail.com"
                  className="hover:text-accent-gold transition-colors break-all"
                >
                  info.rastlina@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="text-lg font-serif font-medium mb-5">
              Store Timings
            </h4>

            <div className="flex items-start gap-3 text-sm text-white/75 mb-6">
              <Clock className="h-4 w-4 text-accent-gold mt-1 shrink-0" />

              <div>
                <p className="font-medium text-white/90">
                  Monday – Saturday
                </p>

                <p className="text-white/60 mt-1">
                  10:00 AM – 7:00 PM
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Need help with plants, décor styling, or bulk requirements?
              </p>

              <Link
                to="/bulk"
                className="inline-flex items-center mt-3 text-sm font-semibold text-accent-gold hover:underline"
              >
                Contact Our Team →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/55">

          <p className="text-center lg:text-left">
            © 2025 Rastlina Plants. All rights reserved.
          </p>

          <div className="flex items-center gap-1 text-center">
            Made with
            <Heart className="h-3.5 w-3.5 text-red-500 mx-1 fill-red-500" />
            by
            <a
              href="https://staffarc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-400 hover:underline ml-1"
            >
              <img
                src="https://www.staffarc.in/images/Staffarc-logo.png"
                alt="StaffArc logo"
                className="h-4 w-4 object-contain"
              />
              StaffArc
            </a>
          </div>

          <p className="text-center lg:text-right">
            Designed with 🌿 in Hyderabad
          </p>
        </div>

      </div>
    </footer>
  );
};