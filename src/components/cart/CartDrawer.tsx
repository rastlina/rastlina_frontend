import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/data/products';
import { Link } from 'react-router-dom';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8F7F4]">
              <h2 className="text-xl font-serif font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#1A3831]" />
                Your Cart
                {totalItems > 0 && (
                  <span className="text-sm font-sans font-bold text-[#667D00]">
                    ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
              <button 
                onClick={closeCart} 
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 rounded-full bg-[#F8F7F4] flex items-center justify-center mb-4 border border-[#E5E0D8]">
                    <ShoppingBag className="h-10 w-10 text-[#667D00]" />
                  </div>
                  <p className="text-xl font-serif font-bold text-gray-900 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mb-8">
                    Start adding some beautiful plants to brighten your space!
                  </p>
                  <Button onClick={closeCart} asChild className="bg-[#1A3831] hover:bg-[#112520] text-white rounded-full px-8 py-6 font-bold tracking-wide uppercase">
                    <Link to="/shop">Browse Plants</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 p-4 bg-[#F8F7F4] rounded-2xl border border-transparent hover:border-[#E5E0D8] transition-colors"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900 text-[15px] truncate mb-1">{item.product.name}</h3>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {item.selectedSize} {item.selectedColor && `• ${item.selectedColor}`}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <p className="font-extrabold text-[#1A3831] text-base">
                            {formatPrice(item.price)}
                          </p>
                          
                          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(
                                item.product.id, 
                                item.selectedSize, 
                                item.selectedColor, 
                                item.quantity - 1
                              )}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-4 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(
                                item.product.id, 
                                item.selectedSize, 
                                item.selectedColor, 
                                item.quantity + 1
                              )}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(
                          item.product.id, 
                          item.selectedSize, 
                          item.selectedColor
                        )}
                        className="self-start p-2 -mr-2 -mt-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-[#F8F7F4]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Delivery</span>
                    <span className="font-bold text-[#667D00] uppercase tracking-wider">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                    <span className="font-serif font-bold text-lg text-gray-900">Total</span>
                    <span className="font-extrabold text-2xl text-[#1A3831]">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                
                {/* Updated Premium Button */}
                <Button asChild className="w-full bg-[#1A3831] hover:bg-[#112520] text-white h-14 rounded-xl font-extrabold text-base shadow-[0_8px_20px_rgba(26,56,49,0.2)] active:scale-[0.98] transition-all uppercase tracking-wider mb-4">
                  <Link to="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <button 
                  onClick={closeCart}
                  className="w-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-2"
                >
                  Continue Shopping
                </button>
                
                <p className="text-[10px] text-center font-bold tracking-widest uppercase text-gray-400 mt-6 flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  Secure Checkout • SSL Encrypted
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};