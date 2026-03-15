import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Heart
} from 'lucide-react';

const footerLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Returns & Refunds', href: '/returns' },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t border-white/10 pt-12 pb-6">
      <div className="container-custom">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="inline-block bg-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform hover:scale-105">
              <img
                src="/logo.png"
                alt="Rastlina Logo"
                className="h-14 w-auto object-contain"
              />
            </div>

            <p className="text-sm text-white/80 leading-relaxed mt-2">
              Rooted in Confidence, Growing with You. We provide premium plants and care essentials to elevate your living spaces.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="https://www.instagram.com/rastlina2025"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-accent-gold transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-accent-gold transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-accent-gold transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-lg font-serif font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map(link => (
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

          {/* Contact + Timings */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">

            {/* Contact */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-4">Get in touch</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent-gold shrink-0" />
                  <span>
                    4th Floor, Lake View Towers,<br />
                    Safari Nagar, Kondapur,<br />
                    Hyderabad, 500084
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-accent-gold" />
                  <span>+91 99154 73575</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent-gold" />
                  <span>info.rastlina@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Timings + Bulk */}
            <div>
              <h4 className="text-lg font-serif font-medium mb-4">Timings</h4>
              <ul className="space-y-2 text-sm text-white/80 mb-6">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-accent-gold mt-0.5" />
                  <div>
                    <p>Monday – Saturday</p>
                    <p className="text-xs text-white/60">10:00 AM – 7:00 PM</p>
                  </div>
                </li>
              </ul>

              <h4 className="text-lg font-serif font-medium mb-3">Bulk Orders</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent-gold" />
                  <span>info.rastlina@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-accent-gold" />
                  <Link
                    to="/contact"
                    className="hover:text-accent-gold underline decoration-accent-gold/50"
                  >
                    Enquire for Bulk Orders
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© 2025 Rastlina Plants. All rights reserved.</p>
          
          <div className="flex justify-center items-center gap-1">
            Made with <Heart className="inline h-4 w-4 text-red-500 mx-1" /> by
            <a
              href="https://staffarc.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-400 hover:underline"
            >
              <img
                src="https://www.staffarc.in/images/Staffarc-logo.png"
                alt="StaffArc logo"
                className="h-5 w-5 object-contain"
              />
              StaffArc
            </a>
          </div>

          <p>Designed with 🌿 in Hyderabad</p>
        </div>

      </div>
    </footer>
  );
};