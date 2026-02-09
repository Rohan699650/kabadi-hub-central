import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order } from '@/types';
import { mockOrders } from '@/data/mockData';

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(mockOrders);

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    const updateOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? { ...order, ...updates } : order))
        );
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrder }}>
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
