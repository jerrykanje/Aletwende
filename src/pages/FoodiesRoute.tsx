import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, X, Search } from 'lucide-react';
import { useOrderSession } from '../contexts/OrderSessionContext';
import { FoodSelectionModal } from '../components/FoodSelectionModal';
import { searchAddresses, getCurrentLocationAddress } from '../services/mockAddressService';
import { Address } from '../types/orderSession';

export const FoodiesRoute: React.FC = () => {
  const navigate = useNavigate();
  const {
    orderSession,
    updatePrimaryLocation,
    addStop,
    removeStop,
    updateStopAddress,
    getUnassignedItems,
    getItemsForStop,
    canAddStop,
    cleanStops,
    unassignItemFromStop,
    assignItemToStop
  } = useOrderSession();

  const [showCurrentLocationModal, setShowCurrentLocationModal] = useState(false);
  const [showStopFoodModal, setShowStopFoodModal] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Address[]>([]);
  const [currentStopMode, setCurrentStopMode] = useState<'current' | 'stop'>('current');

  const unassignedItems = getUnassignedItems();
  const allCartItems = orderSession.cartItems;

  const handleSearchAddresses = useCallback(async (query: string) => {
    setAddressSearchQuery(query);
    const results = await searchAddresses(query);
    setAddressSuggestions(results);
  }, []);

  const handleSelectAddress = (address: Address) => {
    if (currentStopMode === 'current') {
      updatePrimaryLocation(address);
    } else if (selectedStopId) {
      updateStopAddress(selectedStopId, address);
    }
    setShowAddressSearch(false);
    setAddressSearchQuery('');
    setAddressSuggestions([]);
  };

  const handleAddStop = () => {
    if (canAddStop()) {
      addStop();
    }
  };

  const handleViewFoodCurrentLocation = () => {
    setCurrentStopMode('current');
    setShowCurrentLocationModal(true);
  };

  const handleViewFoodStop = (stopId: string) => {
    setSelectedStopId(stopId);
    setCurrentStopMode('stop');
    setShowStopFoodModal(true);
  };

  const handleConfirmCurrentLocationFood = (itemIds: string[]) => {
    const allSelectedIds = new Set(itemIds);
    const currentlyAssigned = allCartItems
      .filter(item => item.assignedTo === 'CURRENT')
      .map(item => item.id);

    currentlyAssigned.forEach(id => {
      if (!allSelectedIds.has(id)) {
        unassignItemFromStop(id, 'CURRENT');
      }
    });

    itemIds.forEach(id => {
      const item = allCartItems.find(item => item.id === id);
      if (item && item.assignedTo !== 'CURRENT') {
        assignItemToStop(id, 'CURRENT');
      }
    });

    setShowCurrentLocationModal(false);
  };

  const handleConfirmStopFood = (itemIds: string[]) => {
    if (!selectedStopId) return;

    const stop = orderSession.foodiesRoute.stops.find(s => s.id === selectedStopId);
    if (!stop) return;

    const currentlyAssigned = allCartItems
      .filter(item => item.assignedTo === selectedStopId)
      .map(item => item.id);

    currentlyAssigned.forEach(id => {
      if (!itemIds.includes(id)) {
        unassignItemFromStop(id, selectedStopId);
      }
    });

    itemIds.forEach(id => {
      const item = allCartItems.find(item => item.id === id);
      if (item && item.assignedTo !== selectedStopId && item.assignedTo === 'CURRENT') {
        assignItemToStop(id, selectedStopId);
      }
    });

    setShowStopFoodModal(false);
  };

  const handleGoToDelivery = () => {
    cleanStops();
    navigate('/select-delivery');
  };

  const handleRemoveItemFromCurrentLocation = (itemId: string) => {
    const item = allCartItems.find(i => i.id === itemId);
    if (item && item.assignedTo === 'CURRENT') {
      unassignItemFromStop(itemId, 'CURRENT');
    }
  };

  const currentLocationItems = allCartItems.filter(
    item => item.assignedTo === 'CURRENT'
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.div
        className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900">Foodies Route</h1>
        </div>
      </motion.div>

      {/* Route Container */}
      <div className="px-4 py-6 pb-32">
        <div className="space-y-4">
          {/* Current Location */}
          <motion.div
            className="bg-white rounded-2xl border-2 border-green-600 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">📍</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Pickup</h3>
                  <motion.button
                    onClick={() => {
                      setCurrentStopMode('current');
                      setShowAddressSearch(true);
                    }}
                    className="w-full text-left"
                  >
                    <p className="font-bold text-gray-900 truncate">
                      {orderSession.foodiesRoute.primaryLocation?.description || 'Current Location'}
                    </p>
                  </motion.button>
                </div>

                {/* View Your Food Button */}
                <motion.button
                  onClick={handleViewFoodCurrentLocation}
                  className="flex items-center space-x-2 bg-gray-100 rounded-xl px-3 py-2 hover:bg-gray-200 transition-colors flex-shrink-0"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <span className="text-xl">🍔</span>
                    {currentLocationItems.length > 0 && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <span className="text-white text-xs font-bold">
                          {currentLocationItems.length}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    View your food
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Current Location Food Items (View Only) */}
            <AnimatePresence>
              {currentLocationItems.length > 0 && (
                <motion.div
                  className="border-t border-gray-200 bg-gray-50 p-4 space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {currentLocationItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">K{item.price}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleRemoveItemFromCurrentLocation(item.id)}
                        className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0 ml-2"
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={14} className="text-red-600" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stops */}
          <AnimatePresence>
            {orderSession.foodiesRoute.stops.map((stop, stopIndex) => {
              const stopItems = allCartItems.filter(item => item.assignedTo === stop.id);
              return (
                <motion.div
                  key={stop.id}
                  className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + stopIndex * 0.1 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">📍</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">
                          Stop {stopIndex + 1}
                        </h3>
                        <motion.button
                          onClick={() => {
                            setSelectedStopId(stop.id);
                            setCurrentStopMode('stop');
                            setShowAddressSearch(true);
                          }}
                          className="w-full text-left"
                        >
                          <p className="font-bold text-gray-900 truncate">
                            {stop.address?.description || 'Add stop'}
                          </p>
                        </motion.button>
                      </div>

                      {/* Add Food Button */}
                      <motion.button
                        onClick={() => handleViewFoodStop(stop.id)}
                        className={`text-xs font-medium px-3 py-2 rounded-xl transition-all flex-shrink-0 ${
                          stopItems.length > 0
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {stopItems.length > 0 ? `Food added${stopItems.length}` : 'Add item'}
                      </motion.button>

                      {/* Remove Stop */}
                      <motion.button
                        onClick={() => removeStop(stop.id)}
                        className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={14} className="text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add Stop Button */}
          {canAddStop() && (
            <motion.button
              onClick={handleAddStop}
              className="w-full border-2 border-green-600 border-dashed rounded-2xl p-4 text-green-600 font-semibold hover:bg-green-50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.98 }}
            >
              + Add Stop
            </motion.button>
          )}
        </div>
      </div>

      {/* Go to Delivery Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={handleGoToDelivery}
          className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl hover:bg-teal-700 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          Go to delivery
        </motion.button>
      </motion.div>

      {/* Address Search Modal */}
      <AnimatePresence>
        {showAddressSearch && (
          <>
            <motion.div
              className="fixed inset-0 bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressSearch(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto pb-24">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search addresses..."
                    value={addressSearchQuery}
                    onChange={(e) => handleSearchAddresses(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-100 rounded-full pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {addressSearchQuery === '' && (
                  <motion.button
                    onClick={() => {
                      handleSelectAddress(getCurrentLocationAddress());
                    }}
                    className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-bold text-gray-900">Use current location</p>
                  </motion.button>
                )}

                <div className="space-y-2">
                  {addressSuggestions.map((address, index) => (
                    <motion.button
                      key={address.place_id}
                      onClick={() => handleSelectAddress(address)}
                      className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="font-bold text-gray-900">{address.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Food Selection Modal - Current Location */}
      <FoodSelectionModal
        isOpen={showCurrentLocationModal}
        onClose={() => setShowCurrentLocationModal(false)}
        onConfirm={handleConfirmCurrentLocationFood}
        allItems={allCartItems}
        currentItems={currentLocationItems}
        isCurrentLocation={true}
        title="Your Food"
      />

      {/* Food Selection Modal - Stop */}
      <FoodSelectionModal
        isOpen={showStopFoodModal}
        onClose={() => setShowStopFoodModal(false)}
        onConfirm={handleConfirmStopFood}
        allItems={allCartItems}
        currentItems={allCartItems.filter(item => item.assignedTo === selectedStopId)}
        stopId={selectedStopId || ''}
        title="Select Food for Stop"
      />
    </div>
  );
};
