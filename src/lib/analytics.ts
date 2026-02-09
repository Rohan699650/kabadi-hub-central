import { Order } from '@/types';
import {
    differenceInHours,
    isWithinInterval,
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subMonths,
} from 'date-fns';

export interface DateRange {
    start: Date;
    end: Date;
}

export type Period = 'thisMonth' | 'lastMonth' | 'thisYear' | 'all';

export interface BusinessMetrics {
    totalLeads: number;
    completedOrders: number;
    cancelledOrders: number;
    repeatOrders: number;
    repeatRate: number;

    partnerPerformance: {
        completed: { name: string; value: number }[];
        cancelled: { name: string; value: number }[];
    };

    salesAgentPerformance: { name: string; value: number }[];
    leadSourcePerformance: { name: string; value: number }[];
    customerTypeDistribution: { name: string; value: number }[];

    tat: {
        leadToRate: number; // Created -> Priced (or Assigned)
        rateToConfirmed: number; // Priced -> Confirmed (or Scheduled)
        confirmedToClose: number; // Confirmed -> Completed
        total: number; // Created -> Completed
    };
}

export const getDateRange = (period: Period): DateRange => {
    const now = new Date();
    switch (period) {
        case 'thisMonth':
            return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'lastMonth':
            return {
                start: startOfMonth(subMonths(now, 1)),
                end: endOfMonth(subMonths(now, 1)),
            };
        case 'thisYear':
            return { start: startOfYear(now), end: endOfYear(now) };
        case 'all':
            return { start: new Date(0), end: new Date(8640000000000000) }; // Effectively min/max
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
};

export const calculateBusinessMetrics = (
    orders: Order[],
    range: DateRange
): BusinessMetrics => {
    // 1. Filter Orders by Date Range
    const filteredOrders = orders.filter((order) =>
        isWithinInterval(new Date(order.createdAt), range)
    );

    const completedOrdersList = filteredOrders.filter((o) => o.status === 'completed');
    const cancelledOrdersList = filteredOrders.filter((o) => o.status === 'cancelled');

    // 2. High Level Metrics
    const totalLeads = filteredOrders.length;
    const completedOrders = completedOrdersList.length;
    const cancelledOrders = cancelledOrdersList.length;

    // 3. Repeat Rate
    const customerOrderCounts: Record<string, number> = {};
    filteredOrders.forEach((order) => {
        customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
    });

    const uniqueCustomers = Object.keys(customerOrderCounts).length;
    const repeatCustomers = Object.values(customerOrderCounts).filter((count) => count > 1).length;
    const repeatOrders = Object.values(customerOrderCounts)
        .filter((count) => count > 1)
        .reduce((sum, count) => sum + count, 0);

    const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    // 4. Partner Performance
    const partnerCompleted: Record<string, number> = {};
    const partnerCancelled: Record<string, number> = {};

    filteredOrders.forEach((order) => {
        const name = order.partnerName || 'Unassigned';
        if (order.status === 'completed') {
            partnerCompleted[name] = (partnerCompleted[name] || 0) + 1;
        } else if (order.status === 'cancelled') {
            partnerCancelled[name] = (partnerCancelled[name] || 0) + 1;
        }
    });

    // 5. Sales Agent Performance
    const salesCounts: Record<string, number> = {};
    filteredOrders.forEach((order) => {
        const agent = order.createdBy || 'System';
        salesCounts[agent] = (salesCounts[agent] || 0) + 1;
    });

    // 6. Lead Source
    const sourceCounts: Record<string, number> = {};
    completedOrdersList.forEach((order) => {
        const source = order.orderSource || 'Other';
        const label = source.charAt(0).toUpperCase() + source.slice(1);
        sourceCounts[label] = (sourceCounts[label] || 0) + 1;
    });

    // 7. Customer Type
    const custTypeCounts: Record<string, number> = { Home: 0, Business: 0 };
    completedOrdersList.forEach((order) => {
        const isBusiness =
            order.description?.toLowerCase().includes('office') ||
            order.scrapCategory === 'Industrial' ||
            order.scrapCategory === 'Corporate';

        if (isBusiness) custTypeCounts.Business++;
        else custTypeCounts.Home++;
    });

    // 8. TAT Metrics
    let leadToRateSum = 0;
    let rateToConfirmedSum = 0;
    let confirmedToCloseSum = 0;
    let totalTatSum = 0;

    let leadsPricedCount = 0;
    let leadsConfirmedCount = 0;
    let leadsClosedCount = 0;
    let leadsTotalCount = 0;

    filteredOrders.forEach((order) => {
        const created = new Date(order.createdAt);
        // Use pricedAt if available, else fall back to assignedAt
        const priced = order.pricedAt ? new Date(order.pricedAt) : (order.assignedAt ? new Date(order.assignedAt) : null);
        // Use confirmedAt if available, else fall back to otwTimestamp or scheduledAt
        const confirmed = order.confirmedAt ? new Date(order.confirmedAt) : (order.otwTimestamp ? new Date(order.otwTimestamp) : (order.scheduledAt ? new Date(order.scheduledAt) : null));
        const completed = order.completedAt ? new Date(order.completedAt) : null;

        if (priced) {
            const diff = differenceInHours(priced, created);
            if (diff >= 0) {
                leadToRateSum += diff;
                leadsPricedCount++;
            }
        }

        if (priced && confirmed) {
            const diff = differenceInHours(confirmed, priced);
            if (diff >= 0) {
                rateToConfirmedSum += diff;
                leadsConfirmedCount++;
            }
        }

        if (confirmed && completed) {
            const diff = differenceInHours(completed, confirmed);
            if (diff >= 0) {
                confirmedToCloseSum += diff;
                leadsClosedCount++;
            }
        }

        if (completed) {
            const diff = differenceInHours(completed, created);
            if (diff >= 0) {
                totalTatSum += diff;
                leadsTotalCount++;
            }
        }
    });

    const avg = (sum: number, count: number) => (count > 0 ? parseFloat((sum / count).toFixed(1)) : 0);

    return {
        totalLeads,
        completedOrders,
        cancelledOrders,
        repeatOrders,
        repeatRate,
        partnerPerformance: {
            completed: Object.entries(partnerCompleted).map(([name, value]) => ({ name, value })),
            cancelled: Object.entries(partnerCancelled).map(([name, value]) => ({ name, value })),
        },
        salesAgentPerformance: Object.entries(salesCounts).map(([name, value]) => ({ name, value })),
        leadSourcePerformance: Object.entries(sourceCounts).map(([name, value]) => ({ name, value })),
        customerTypeDistribution: Object.entries(custTypeCounts)
            .map(([name, value]) => ({ name, value }))
            .filter(x => x.value > 0),
        tat: {
            leadToRate: avg(leadToRateSum, leadsPricedCount),
            rateToConfirmed: avg(rateToConfirmedSum, leadsConfirmedCount),
            confirmedToClose: avg(confirmedToCloseSum, leadsClosedCount),
            total: avg(totalTatSum, leadsTotalCount),
        }
    };
};
