import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
    id: string;
    storeId: string;
    storeName: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: any, store: any) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, delta: number) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        // Load initial state
        const loadCart = async () => {
            try {
                const stored = await AsyncStorage.getItem('cart_state');
                if (stored) setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        };
        loadCart();
    }, []);

    const saveCart = async (newItems: CartItem[]) => {
        try {
            await AsyncStorage.setItem('cart_state', JSON.stringify(newItems));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    };

    const addToCart = (menuItem: any, store: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === menuItem.id);
            let updated;
            if (existing) {
                updated = prev.map(i => i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                updated = [...prev, {
                    id: menuItem.id,
                    storeId: store.id,
                    storeName: store.name,
                    name: menuItem.name,
                    price: Number(menuItem.price) || 0,
                    imageUrl: menuItem.imageUrl || 'https://via.placeholder.com/150',
                    quantity: 1
                }];
            }
            saveCart(updated);
            return updated;
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setItems(prev => {
            const updated = prev.map(i => {
                if (i.id === itemId) return { ...i, quantity: Math.max(1, i.quantity + delta) };
                return i;
            });
            saveCart(updated);
            return updated;
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(prev => {
            const updated = prev.filter(i => i.id !== itemId);
            saveCart(updated);
            return updated;
        });
    };

    const clearCart = () => {
        setItems([]);
        saveCart([]);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
