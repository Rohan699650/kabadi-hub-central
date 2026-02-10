import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { mockOrders } from '@/data/mockData';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    resetData: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    // 1. Initialize from localStorage or fallback to mockData
    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem('kabadi_orders_v2');
        if (saved) {
            try {
                // Parse dates back from strings
                const parsed = JSON.parse(saved, (key, value) => {
                    // Heuristic to detect ISO date strings and convert back to Date objects
                    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                        return new Date(value);
                    }
                    return value;
                });
                return parsed;
            } catch (e) {
                console.error("Failed to parse orders from storage", e);
                return mockOrders;
            }
        }
        return mockOrders;
    });

    // 2. Persist to localStorage whenever orders change
    useEffect(() => {
        localStorage.setItem('kabadi_orders_v2', JSON.stringify(orders));
    }, [orders]);

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    const updateOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? { ...order, ...updates } : order))
        );
    };

    const resetData = () => {
        setOrders(mockOrders);
        localStorage.removeItem('kabadi_orders_v2');
        window.location.reload();
    }

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrder, resetData }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
