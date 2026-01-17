import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { CartItem } from '../types/orderSession';

interface FoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemIds: string[]) => void;
  allItems: CartItem[];
  currentItems: CartItem[];
  stopId?: string;
  isCurrentLocation?: boolean;
  title?: string;
}

export const FoodSelectionModal: React.FC<FoodSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  allItems,
  currentItems,
  stopId,
  isCurrentLocation = false,
  title = 'Select Food'
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(currentItems.map(item => item.id))
  );

  const itemsToDisplay = useMemo(() => {
    if (isCurrentLocation) {
      return allItems;
    }
    return allItems;
  }, [allItems, isCurrentLocation]);

  const isItemAssignedToOther = (item: CartItem): boolean => {
    if (isCurrentLocation) return false;
    return item.assignedTo !== 'CURRENT' && item.assignedTo !== stopId;
  };

  const isItemSelected = (itemId: string): boolean => {
    return selectedIds.has(itemId);
  };

  const toggleItem = (item: CartItem) => {
    if (isItemAssignedToOther(item)) return;

    const newSelectedIds = new Set(selectedIds);

    if (newSelectedIds.has(item.id)) {
      const countAtCurrent = Array.from(newSelectedIds).filter(
        id => {
          const cartItem = allItems.find(i => i.id === id);
          return cartItem && cartItem.assignedTo === 'CURRENT';
        }
      ).length;

      if (isCurrentLocation && countAtCurrent === 1 && item.assignedTo === 'CURRENT') {
        return;
      }

      newSelectedIds.delete(item.id);
    } else {
      newSelectedIds.add(item.id);
    }

    setSelectedIds(newSelectedIds);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <motion.button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} className="text-gray-600" />
              </motion.button>
            </div>

            {/* Food Items */}
            <div className="px-6 py-4 space-y-3 pb-24">
              {itemsToDisplay.map((item, index) => {
                const isAssignedToOther = isItemAssignedToOther(item);
                const isSelected = isItemSelected(item.id);

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => !isAssignedToOther && toggleItem(item)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center space-x-4 ${
                      isAssignedToOther
                        ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    disabled={isAssignedToOther}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">K{item.price}</p>
                      {isAssignedToOther && (
                        <p className="text-xs text-gray-500 mt-1">Assigned to another stop</p>
                      )}
                    </div>

                    {/* Checkbox/X */}
                    {isSelected && !isAssignedToOther && (
                      <motion.div
                        className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      >
                        <span className="text-white text-sm">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Confirm Button */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleConfirm}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
