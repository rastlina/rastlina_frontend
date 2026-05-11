// Product images
import monsteraImg from "@/assets/products/monstera.jpg";
import snakePlantImg from "@/assets/products/snake-plant.jpg";
import peaceLilyImg from "@/assets/products/peace-lily.jpg";
import pothosImg from "@/assets/products/pothos.jpg";
import zzPlantImg from "@/assets/products/zz-plant.jpg";
import arecaPalmImg from "@/assets/products/areca-palm.jpg";

export interface ProductSize {
  label: string;
  price: number;
}
export interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
  color_id?: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string[];
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images?: ProductImage[];
  careLevel: 'Very Easy' | 'Easy' | 'Moderate' | 'Expert';
  waterFrequency: string;
  light: string;
  petSafe: boolean;
  sizes: ProductSize[];
  colors: string[];
  image: string;
  description: string;
  inStock: boolean;
  featured: boolean;
  selfWatering?: boolean;
  
  onOffer?: boolean;
  type: 'plant' | 'pot' | 'seed' | 'care' | 'combo';
}

export const products: Product[] = [
  // --- PLANTS ---
  {
    id: 'MON-001',
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    category: ['living-room', 'clean-air', 'indoor'],
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.8,
    reviewCount: 89,
    careLevel: 'Easy',
    waterFrequency: 'Weekly',
    light: 'Bright Indirect',
    petSafe: false,
    sizes: [{ label: 'Small', price: 999 }, { label: 'Medium', price: 1999 }],
    colors: ['Terracotta', 'White'],
    image: monsteraImg,
    description: 'Large, glossy leaves perfect for modern spaces.',
    inStock: true,
    featured: true,
    type: 'plant',
    onOffer: true,
  },
  {
    id: 'SNK-002',
    name: 'Snake Plant',
    slug: 'snake-plant',
    category: ['bedroom', 'clean-air', 'indoor'],
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.9,
    reviewCount: 156,
    careLevel: 'Very Easy',
    waterFrequency: 'Bi-weekly',
    light: 'Low',
    petSafe: false,
    sizes: [{ label: 'Small', price: 599 }, { label: 'Medium', price: 999 }],
    colors: ['Terracotta', 'White'],
    image: snakePlantImg,
    description: 'The ultimate beginner plant. Thrives on neglect.',
    inStock: true,
    featured: true,
    type: 'plant',
    onOffer: false,
  },
  {
    id: 'PCL-003',
    name: 'Peace Lily',
    slug: 'peace-lily',
    category: ['bedroom', 'flowering'],
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    rating: 4.7,
    reviewCount: 203,
    careLevel: 'Easy',
    waterFrequency: 'Weekly',
    light: 'Low',
    petSafe: false,
    sizes: [{ label: 'Small', price: 799 }, { label: 'Medium', price: 1299 }],
    colors: ['White'],
    image: peaceLilyImg,
    description: 'Elegant white blooms and air-purifying qualities.',
    inStock: true,
    featured: true,
    type: 'plant',
    onOffer: false,
  },
  {
    id: 'PTH-004',
    name: 'Golden Pothos',
    slug: 'golden-pothos',
    category: ['office', 'good-luck'],
    price: 699,
    originalPrice: 999,
    discount: 30,
    rating: 4.8,
    reviewCount: 312,
    careLevel: 'Very Easy',
    waterFrequency: 'Weekly',
    light: 'Low',
    petSafe: false,
    sizes: [{ label: 'Small', price: 399 }, { label: 'Medium', price: 699 }],
    colors: ['White', 'Terracotta'],
    image: pothosImg,
    description: 'The money plant that brings prosperity.',
    inStock: true,
    featured: false,
    type: 'plant',
    onOffer: true,
  },
  {
    id: 'ZZ-005',
    name: 'ZZ Plant',
    slug: 'zz-plant',
    category: ['office', 'clean-air'],
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.9,
    reviewCount: 178,
    careLevel: 'Very Easy',
    waterFrequency: 'Bi-weekly',
    light: 'Low',
    petSafe: false,
    sizes: [{ label: 'Small', price: 899 }, { label: 'Medium', price: 1499 }],
    colors: ['Black', 'White'],
    image: zzPlantImg,
    description: 'Glossy leaves that thrive in low light.',
    inStock: true,
    featured: true,
    type: 'plant',
    onOffer: false,
  },
  {
    id: 'ARC-006',
    name: 'Areca Palm',
    slug: 'areca-palm',
    category: ['living-room', 'pet-friendly'],
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    rating: 4.6,
    reviewCount: 94,
    careLevel: 'Moderate',
    waterFrequency: 'Twice Weekly',
    light: 'Bright',
    petSafe: true,
    sizes: [{ label: 'Medium', price: 2499 }, { label: 'Large', price: 3499 }],
    colors: ['Terracotta'],
    image: arecaPalmImg,
    description: 'Tropical vibes and air humidifying.',
    inStock: true,
    featured: false,
    type: 'plant',
    onOffer: false,
  },

  // --- SELF WATERING PLANTERS ---
  {
    id: 'SWP-001',
    name: 'Hydro-Loop Smart Pot',
    slug: 'hydro-loop-pot',
    category: ['pots', 'self-watering'],
    price: 899,
    originalPrice: 1299,
    discount: 30,
    rating: 4.9,
    reviewCount: 120,
    careLevel: 'Very Easy',
    waterFrequency: 'N/A',
    light: 'N/A',
    petSafe: true,
    sizes: [{ label: 'Standard (6")', price: 899 }, { label: 'Large (10")', price: 1499 }],
    colors: ['White', 'Matte Black', 'Sage'],
    image: snakePlantImg, // Use pot images if available
    description: 'Wicking system keeps plants hydrated for up to 2 weeks.',
    inStock: true,
    featured: true,
    selfWatering: true, // Flagged for the section
    type: 'pot',
    onOffer: false,
  },
  {
    id: 'SWP-002',
    name: 'Glass Indicator Planter',
    slug: 'glass-indicator-planter',
    category: ['pots', 'self-watering'],
    price: 699,
    originalPrice: 999,
    discount: 30,
    rating: 4.7,
    reviewCount: 85,
    careLevel: 'Very Easy',
    waterFrequency: 'N/A',
    light: 'N/A',
    petSafe: true,
    sizes: [{ label: 'Medium (5")', price: 699 }],
    colors: ['Transparent'],
    image: zzPlantImg, 
    description: 'Visual water level indicator. Perfect for beginners.',
    inStock: true,
    featured: false,
    selfWatering: true,
    type: 'pot',
    onOffer: true,
  },
  {
    id: 'SWP-003',
    name: 'Reservoir XL Planter',
    slug: 'reservoir-xl-planter',
    category: ['pots', 'self-watering'],
    price: 1299,
    originalPrice: 1599,
    discount: 18,
    rating: 4.8,
    reviewCount: 42,
    careLevel: 'Very Easy',
    waterFrequency: 'N/A',
    light: 'N/A',
    petSafe: true,
    sizes: [{ label: 'Large (12")', price: 1299 }],
    colors: ['Terracotta', 'Grey'],
    image: arecaPalmImg, 
    description: 'Large capacity reservoir for thirsty tropical plants.',
    inStock: true,
    featured: true,
    selfWatering: true,
    type: 'pot',
    onOffer: false,
  },

  // --- STANDARD POTS ---
  {
    id: 'POT-001',
    name: 'Minimalist Ceramic Pot',
    slug: 'minimalist-ceramic-pot',
    category: ['pots'],
    price: 499,
    originalPrice: 699,
    discount: 28,
    rating: 4.9,
    reviewCount: 150,
    careLevel: 'Very Easy',
    waterFrequency: 'N/A',
    light: 'N/A',
    petSafe: true,
    sizes: [{ label: 'Small', price: 499 }, { label: 'Medium', price: 799 }],
    colors: ['White', 'Black'],
    image: monsteraImg,
    description: 'Premium matte finish ceramic pot.',
    inStock: true,
    featured: false,
    type: 'pot',
    onOffer: true,
  },

  // --- SEEDS & CARE ---
  {
    id: 'SED-001',
    name: 'Italian Basil Seeds',
    slug: 'basil-seeds',
    category: ['seeds', 'herbs'],
    price: 149,
    originalPrice: 199,
    discount: 25,
    rating: 4.9,
    reviewCount: 42,
    careLevel: 'Easy',
    waterFrequency: 'Daily',
    light: 'Bright',
    petSafe: true,
    sizes: [{ label: 'Packet', price: 149 }],
    colors: ['Green'],
    image: monsteraImg,
    description: 'Grow your own aromatic basil.',
    inStock: true,
    featured: false,
    type: 'seed',
    onOffer: false,
  },
  {
    id: 'CAR-001',
    name: 'Organic Liquid Fertilizer',
    slug: 'liquid-fertilizer',
    category: ['care'],
    price: 399,
    originalPrice: 599,
    discount: 33,
    rating: 4.9,
    reviewCount: 210,
    careLevel: 'Very Easy',
    waterFrequency: 'N/A',
    light: 'N/A',
    petSafe: true,
    sizes: [{ label: '250ml', price: 399 }],
    colors: ['N/A'],
    image: snakePlantImg,
    description: 'Seaweed based organic nutrition.',
    inStock: true,
    featured: true,
    type: 'care',
    onOffer: false,
  },

  // --- COMBOS ---
  {
    id: 'BND-001',
    name: 'The "Unkillable" Duo',
    slug: 'unkillable-duo',
    category: ['bundles', 'beginner'],
    price: 1499,
    originalPrice: 2000,
    discount: 25,
    rating: 5.0,
    reviewCount: 42,
    careLevel: 'Very Easy',
    waterFrequency: 'Bi-weekly',
    light: 'Low',
    petSafe: false,
    sizes: [{ label: 'Standard', price: 1499 }],
    colors: ['Terracotta'],
    image: snakePlantImg,
    description: 'Snake Plant + ZZ Plant.',
    inStock: true,
    featured: true,
    type: 'combo',
    onOffer: true,
  }
];

// --- HELPER FUNCTIONS ---

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category.includes(category));
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

// !!! EXPORTED FUNCTION FOR HOME PAGE !!!
export const getSelfWateringProducts = (): Product[] => {
  return products.filter(product => product.selfWatering === true);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(product => product.slug === slug);
};

export const getBundles = (): Product[] => {
  return products.filter(product => product.type === 'combo');
};

export const getOfferProducts = (): Product[] => {
  return products.filter(product => product.onOffer);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};