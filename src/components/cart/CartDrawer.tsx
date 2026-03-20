import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Truck, Percent, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/data/products';
import { Link, useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  // Mocking an original price to show the strikethrough discount from the screenshot
  const calculateOriginalPrice = (price: number) => price * 1.4;
  const totalOriginal = items.reduce((sum, item) => sum + (calculateOriginalPrice(item.price) * item.quantity), 0);
  const totalSaved = totalOriginal - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-white">
              <h2 className="text-base font-bold uppercase tracking-widest text-primary">
                Cart {totalItems > 0 && <span className="normal-case font-normal text-gray-500 text-sm ml-1">({totalItems})</span>}
              </h2>
              <button 
                onClick={closeCart} 
                className="p-1 hover:bg-gray-100 rounded-md transition-colors text-primary"
                aria-label="Close cart"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Free Delivery Banner */}
            {items.length > 0 && (
              <div className="bg-[#667D00]/10 px-5 py-3 flex items-center gap-2 border-y border-[#667D00]/20">
                <Truck className="h-5 w-5 text-[#667D00]" />
                <p className="text-sm text-primary font-medium">
                  Yay! you're getting <span className="font-bold text-[#667D00] underline decoration-[#667D00]/30 underline-offset-2">Free Delivery</span>
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl font-serif font-bold text-primary mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mb-8">
                    Start adding some beautiful plants to brighten your space!
                  </p>
                  <Button onClick={closeCart} asChild className="bg-primary hover:bg-primary/90 text-white rounded-md px-8 h-12 font-bold tracking-wide uppercase w-full">
                    <Link to="/shop">Browse Plants</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 p-5 bg-white"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-50 flex-shrink-0 border border-gray-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-primary text-[15px] leading-tight pr-2">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <p className="text-[13px] text-gray-500 mt-1">
                          {item.selectedSize} {item.selectedColor && `| ${item.selectedColor}`}
                        </p>
                        
                        {/* Qty & Price Row */}
                        <div className="flex items-end justify-between mt-auto pt-4">
                          {/* Quantity Selector (Screenshot style) */}
                          <div className="flex items-center border border-gray-200 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-medium text-[13px] text-primary">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <span className="font-semibold text-primary text-[15px]">{formatPrice(item.price)}</span>
                            <span className="text-xs text-gray-400 line-through ml-1.5">{formatPrice(calculateOriginalPrice(item.price))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Summary Area */}
            {items.length > 0 && (
              <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-3">
                
                {/* Offer Banner 1 */}
                <div className="bg-[#667D00]/10 rounded-md p-3 flex items-center gap-2.5">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    Add <span className="font-bold text-[#667D00]">₹379</span> more to get <span className="font-bold text-[#667D00]">10% OFF</span>
                  </p>
                </div>

                {/* Offer Banner 2 */}
                <div className="bg-gradient-to-r from-[#f0f9ff] to-[#e0f2fe] rounded-md p-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-primary">
                    14 days Guaranteed Replacement of Damaged Product
                  </p>
                  <ShieldCheck className="h-8 w-8 text-[#00798C] opacity-80 shrink-0" strokeWidth={1.5} />
                </div>

                {/* Totals */}
                <div className="flex justify-between items-end pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">To Pay: {formatPrice(subtotal)}</span>
                  </div>
                  <span className="font-bold text-sm text-[#667D00]">{formatPrice(totalSaved)} saved!</span>
                </div>
                
                {/* Checkout Button */}
                <Button 
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-sm font-bold text-sm uppercase tracking-wider transition-all"
                >
                  CHECKOUT — {formatPrice(subtotal)}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};