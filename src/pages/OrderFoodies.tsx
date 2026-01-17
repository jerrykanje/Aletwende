import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, X, CheckCircle } from 'lucide-react';
import { useOrderSession } from '../contexts/OrderSessionContext';
import { getFoodsByStore } from '../services/mockFoodService';
import { Food } from '../services/mockFoodService';

export const OrderFoodies: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderSession, addToCart, removeFromCart } = useOrderSession();

  const storeId = (location.state as any)?.storeId || 'store-1';
  const storeName = (location.state as any)?.storeName || 'Hungry Lion';

  const [foods, setFoods] = useState<Food[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  useEffect(() => {
    setFoods(getFoodsByStore(storeId));
  }, [storeId]);

  const cartCount = orderSession.cartItems.filter(item => item.storeId === storeId).length;
  const cartTotal = orderSession.cartItems
    .filter(item => item.storeId === storeId)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isInCart = (foodId: string) => {
    return orderSession.cartItems.some(item => item.id === foodId);
  };

  const handleAddToCart = (food: Food) => {
    addToCart({
      id: `${food.id}-${Date.now()}`,
      storeId: food.storeId,
      storeName: food.storeName,
      name: food.name,
      image: food.image,
      price: food.price,
      quantity: 1
    });
    setRecentlyAdded(food.id);
    setTimeout(() => setRecentlyAdded(null), 500);
  };

  const handleRemoveFromCart = (foodId: string) => {
    const itemToRemove = orderSession.cartItems.find(item => item.id.startsWith(foodId));
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
    }
  };

  const handleCompleteOrder = () => {
    if (cartCount === 0) return;
    navigate('/foodies-route');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
          </div>

          {/* Cart Icon */}
          <motion.button
            onClick={() => {}}
            className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} className="text-gray-700" />
            {cartCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              >
                <span className="text-white text-xs font-bold">{cartCount}</span>
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Food Grid */}
      <div className="px-4 py-6 pb-40">
        {foods.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {foods.map((food) => {
              const isAdded = isInCart(food.id);
              const wasJustAdded = recentlyAdded === food.id;

              return (
                <motion.div
                  key={food.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    wasJustAdded ? 'ring-2 ring-green-500' : ''
                  }`}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Food Image */}
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                    {isAdded && (
                      <motion.div
                        className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <CheckCircle size={32} className="text-green-400" />
                      </motion.div>
                    )}
                  </div>

                  {/* Food Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm">
                      {food.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{food.category}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">K{food.price}</p>

                      {/* Add/Remove Button */}
                      {!isAdded ? (
                        <motion.button
                          onClick={() => handleAddToCart(food)}
                          className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 active:scale-90 transition-colors"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Plus size={20} className="text-white" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleRemoveFromCart(food.id)}
                          className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 transition-colors"
                          whileTap={{ scale: 0.85 }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <X size={20} className="text-white" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No items available</h3>
            <p className="text-gray-600">Check back later</p>
          </motion.div>
        )}
      </div>

      {/* Complete Order Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-xl"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.button
          onClick={handleCompleteOrder}
          disabled={cartCount === 0}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            cartCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
          }`}
          whileTap={{ scale: cartCount === 0 ? 1 : 0.95 }}
        >
          {cartCount > 0 ? 'Complete Order' : 'Add items to continue'}
        </motion.button>
        {cartCount > 0 && (
          <motion.div
            className="flex justify-between items-center mt-3 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-gray-600">
              <span className="font-bold text-gray-900">{cartCount}</span> item{cartCount !== 1 ? 's' : ''} in cart
            </span>
            <span className="font-bold text-gray-900">K{cartTotal}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
