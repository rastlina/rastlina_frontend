import { Link } from 'react-router-dom';

export default function About() {
  return <main className="bg-[#F8F7F4] pt-[120px] pb-20">
    <article className="container-custom max-w-4xl space-y-6 py-12 text-[#18392a]">
      <h1 className="font-serif text-4xl">About Rastlina</h1>
      <p>Rastlina Nature Hub Private Limited is based in Hyderabad, India. We offer living plant sets for homes, workspaces and gifting.</p>
      <h2 className="font-serif text-2xl">A plant gift, ready to enjoy</h2>
      <p>Our plant sets include the plant listed, a self-watering pot and soil mix. Choose a plant for its light and care needs, whether you are buying for yourself, a housewarming, a birthday or a thank-you gift.</p>
      <p>Each plant is a living item. Leaf patterns, shape and growth vary naturally. A self-watering pot helps manage watering, but you still need to check the soil and adjust care for the plant and its surroundings.</p>
      <h2 className="font-serif text-2xl">Company and contact details</h2>
      <p>Rastlina Nature Hub Private Limited<br/>GSTIN: 36AAPCR7860K1ZK</p>
      <address className="not-italic">4th Floor, Lake View Towers, Safari Nagar, Kondapur, Hyderabad, 500084, India.</address>
      <p><a href="tel:+918143814466">+91 81438 14466</a><br/><a href="mailto:info.rastlina@gmail.com">info.rastlina@gmail.com</a></p>
      <nav className="flex flex-wrap gap-5" aria-label="About Rastlina links">
        <Link to="/shop" className="underline">Shop plants</Link>
        <Link to="/bulk" className="underline">Bulk and corporate gifts</Link>
        <Link to="/shipping-policy" className="underline">Shipping information</Link>
        <Link to="/replacement-policy" className="underline">Replacement policy</Link>
      </nav>
    </article>
  </main>;
}
