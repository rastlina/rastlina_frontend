import { Link } from 'react-router-dom';
import { Star, Heart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart, items, removeFromCart, updateQuantity } = useCart();

  // Find if this product is already in the cart (checking default size/color for grid view)
  const defaultSize = product.sizes?.[0] || { label: 'Standard', price: product.price };
  const defaultColor = product.colors?.[0] || 'Standard';
  
  const cartItem = items.find(
    item => item.product.id === product.id && 
    item.selectedSize === defaultSize.label && 
    item.selectedColor === defaultColor
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultSize.label, defaultColor, defaultSize.price);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, defaultSize.label, defaultColor, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
        if(cartItem.quantity === 1) {
            removeFromCart(product.id, defaultSize.label, defaultColor);
        } else {
            updateQuantity(product.id, defaultSize.label, defaultColor, cartItem.quantity - 1);
        }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <Link to={`/product/${product.slug}`} className="block flex-1 flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.onOffer && (
              <span className="bg-accent-gold text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide shadow-sm">
                Sale
              </span>
            )}
            {product.discount > 0 && !product.onOffer && (
              <span className="bg-accent-earth text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide shadow-sm">
                -{product.discount}%
              </span>
            )}
          </div>
          
          <button 
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-[#2e3b0b] shadow-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-[#2e3b0b] truncate mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="h-3.5 w-3.5 fill-accent-gold text-accent-gold" />
              <span className="text-xs font-bold text-gray-700">{Number(product.rating).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#2e3b0b]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* ADD TO CART / QUANTITY TOGGLE */}
          
        </div>
      </Link>
    </motion.div>
  );
};