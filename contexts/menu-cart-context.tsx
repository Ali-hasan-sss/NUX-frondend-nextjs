"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItemExtra {
  name: string;
  price: number;
  calories: number;
}

export interface CartItem {
  id: number;
  title: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
  selectedExtras?: CartItemExtra[];
  baseCalories?: number;
  preparationTime?: number;
  allergies?: string[];
  kitchenSection?: {
    id: number;
    name: string;
    description?: string;
  };
  notes?: string;
}

interface MenuCartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: number, selectedExtras?: CartItemExtra[]) => void;
  updateQuantity: (itemId: number, quantity: number, selectedExtras?: CartItemExtra[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  tableNumber: number | null;
  setTableNumber: (tableNumber: number | null) => void;
}

const MenuCartContext = createContext<MenuCartContextType | undefined>(
  undefined
);

export function MenuCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  // Helper function to create a unique key for an item based on id and selectedExtras
  const getItemKey = useCallback((id: number, selectedExtras?: CartItemExtra[]) => {
    const extrasKey = selectedExtras 
      ? JSON.stringify(selectedExtras.sort((a, b) => a.name.localeCompare(b.name)))
      : '';
    return `${id}_${extrasKey}`;
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const itemKey = getItemKey(item.id, item.selectedExtras);
      const existingItem = prevItems.find((i) => {
        const iKey = getItemKey(i.id, i.selectedExtras);
        return iKey === itemKey;
      });
      
      if (existingItem) {
        // Same item with same extras - increase quantity
        return prevItems.map((i) => {
          const iKey = getItemKey(i.id, i.selectedExtras);
          return iKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i;
        });
      }
      // Different item or different extras - add as new item
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, [getItemKey]);

  const removeItem = useCallback((itemId: number, selectedExtras?: CartItemExtra[]) => {
    setItems((prevItems) => {
      if (selectedExtras) {
        // Remove specific item with specific extras
        const itemKey = JSON.stringify({
          id: itemId,
          selectedExtras: selectedExtras,
        });
        return prevItems.filter((i) => {
          const iKey = JSON.stringify({
            id: i.id,
            selectedExtras: i.selectedExtras || [],
          });
          return iKey !== itemKey;
        });
      }
      // Remove all items with this ID (backward compatibility)
      return prevItems.filter((i) => i.id !== itemId);
    });
  }, []);

  const updateQuantity = useCallback(
    (itemId: number, quantity: number, selectedExtras?: CartItemExtra[]) => {
      if (quantity <= 0) {
        removeItem(itemId, selectedExtras);
        return;
      }
      setItems((prevItems) => {
        if (selectedExtras) {
          // Update specific item with specific extras
          const itemKey = JSON.stringify({
            id: itemId,
            selectedExtras: selectedExtras,
          });
          return prevItems.map((i) => {
            const iKey = JSON.stringify({
              id: i.id,
              selectedExtras: i.selectedExtras || [],
            });
            if (iKey === itemKey) {
              return { ...i, quantity };
            }
            return i;
          });
        }
        // Update first item with this ID (backward compatibility)
        const firstIndex = prevItems.findIndex((i) => i.id === itemId);
        if (firstIndex !== -1) {
          return prevItems.map((i, idx) =>
            idx === firstIndex ? { ...i, quantity } : i
          );
        }
        return prevItems;
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = Math.max(0, Number(item.price) || 0);
    const extrasPrice =
      item.selectedExtras?.reduce(
        (extrasSum, extra) => extrasSum + Math.max(0, extra.price || 0),
        0
      ) || 0;
    return sum + Math.max(0, itemPrice + extrasPrice) * item.quantity;
  }, 0);

  return (
    <MenuCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        tableNumber,
        setTableNumber,
      }}
    >
      {children}
    </MenuCartContext.Provider>
  );
}

export function useMenuCart() {
  const context = useContext(MenuCartContext);
  if (context === undefined) {
    throw new Error("useMenuCart must be used within a MenuCartProvider");
  }
  return context;
}
