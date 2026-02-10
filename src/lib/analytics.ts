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

    // Advanced Business Metrics
    revenue: { total: number; b2b: number; b2c: number };
    gmv: { total: number; b2b: number; b2c: number };
    weight: { total: number; b2b: number; b2c: number };
    aov: { total: number; b2b: number; b2c: number };
    arpo: { total: number; b2b: number; b2c: number };
    completedSplit: { b2b: number; b2c: number };
    avgBusinessInvoiceValue: number;

    partnerPerformance: {
        completed: { name: string; value: number }[];
        cancelled: { name: string; value: number }[];
    };

    salesAgentPerformance: { name: string; value: number }[];
    leadSourcePerformance: { name: string; value: number }[];
    customerTypeDistribution: { name: string; value: number }[];

    tat: {
        leadToRate: number;
        rateToConfirmed: number;
        confirmedToClose: number;
        total: number;
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
            return { start: new Date(0), end: new Date(8640000000000000) };
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
};

export const calculateBusinessMetrics = (
    orders: Order[],
    range: DateRange
): BusinessMetrics => {
    // Safety check for inputs
    if (!orders || !Array.isArray(orders)) {
        return getEmptyMetrics();
    }

    // 1. Filter Orders by Date Range
    const filteredOrders = orders.filter((order) => {
        try {
            if (!order.createdAt) return false;
            const date = new Date(order.createdAt);
            if (isNaN(date.getTime())) return false;
            return isWithinInterval(date, range);
        } catch (e) {
            return false;
        }
    });

    const completedOrdersList = filteredOrders.filter((o) => o.status === 'completed');
    const cancelledOrdersList = filteredOrders.filter((o) => o.status === 'cancelled');

    // 2. High Level Metrics
    const totalLeads = filteredOrders.length;
    const completedOrdersCount = completedOrdersList.length;
    const cancelledOrders = cancelledOrdersList.length;

    // --- Business Metrics Calculation ---
    let revenueTotal = 0, revenueB2B = 0, revenueB2C = 0;
    let gmvTotal = 0, gmvB2B = 0, gmvB2C = 0;
    let weightTotal = 0, weightB2B = 0, weightB2C = 0;
    let completedB2B = 0, completedB2C = 0;

    completedOrdersList.forEach(order => {
        // Determine Type (B2B vs B2C)
        const desc = order.description?.toLowerCase() || '';
        const cat = order.scrapCategory || '';

        const isBusiness =
            desc.includes('office') ||
            cat === 'Industrial' ||
            cat === 'Corporate';

        // Formula: Revenue = Commission Amount (Ensuring it's not negative)
        // User Requirement: "Revenue = SUM(commissionAmount)"
        // Fallback: If commission is missing, calculate it but cap at 0 minimum? 
        // User said: "Revenue must never be negative".
        let comm = order.commission || 0;
        if (comm < 0) comm = 0; // Safety clamp

        // Formula: GMV = Partner Invoice Value (SUM(partnerInvoiceValue))
        const gmv = order.partnerInvoice?.total || 0;

        // Formula: Weight = Sum of invoice weights
        const weight = order.totalScrapWeight || 0;

        revenueTotal += comm;
        gmvTotal += gmv;
        weightTotal += weight;

        if (isBusiness) {
            revenueB2B += comm;
            gmvB2B += gmv;
            weightB2B += weight;
            completedB2B++;
        } else {
            revenueB2C += comm;
            gmvB2C += gmv;
            weightB2C += weight;
            completedB2C++;
        }
    });

    // AOV = GMV / completed orders
    const aovTotal = completedOrdersCount > 0 ? gmvTotal / completedOrdersCount : 0;
    // B2B AOV
    const aovB2B = completedB2B > 0 ? gmvB2B / completedB2B : 0;
    // B2C AOV
    const aovB2C = completedB2C > 0 ? gmvB2C / completedB2C : 0;

    // ARPO = Revenue / Completed Orders
    const arpoTotal = completedOrdersCount > 0 ? revenueTotal / completedOrdersCount : 0;
    const arpoB2B = completedB2B > 0 ? revenueB2B / completedB2B : 0;
    const arpoB2C = completedB2C > 0 ? revenueB2C / completedB2C : 0;

    const avgBusinessInvoiceValue = completedB2B > 0 ? gmvB2B / completedB2B : 0;

    // 3. Repeat Rate
    const customerOrderCounts: Record<string, number> = {};
    filteredOrders.forEach((order) => {
        if (order.customerId) {
            customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
        }
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
        const desc = order.description?.toLowerCase() || '';
        const cat = order.scrapCategory || '';
        const isBusiness =
            desc.includes('office') ||
            cat === 'Industrial' ||
            cat === 'Corporate';

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

    const safeDate = (d: Date | string | undefined): Date | null => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date;
    };

    filteredOrders.forEach((order) => {
        const created = safeDate(order.createdAt);
        if (!created) return;

        const priced = safeDate(order.pricedAt) || safeDate(order.assignedAt);
        const confirmed = safeDate(order.confirmedAt) || safeDate(order.otwTimestamp) || safeDate(order.scheduledAt);
        const completed = safeDate(order.completedAt);

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
        completedOrders: completedOrdersCount,
        cancelledOrders,
        repeatOrders,
        repeatRate,

        revenue: { total: revenueTotal, b2b: revenueB2B, b2c: revenueB2C },
        gmv: { total: gmvTotal, b2b: gmvB2B, b2c: gmvB2C },
        weight: { total: weightTotal, b2b: weightB2B, b2c: weightB2C },
        aov: { total: aovTotal, b2b: aovB2B, b2c: aovB2C },
        arpo: { total: arpoTotal, b2b: arpoB2B, b2c: arpoB2C },
        completedSplit: { b2b: completedB2B, b2c: completedB2C },
        avgBusinessInvoiceValue,

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

function getEmptyMetrics(): BusinessMetrics {
    return {
        totalLeads: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        repeatOrders: 0,
        repeatRate: 0,
        revenue: { total: 0, b2b: 0, b2c: 0 },
        gmv: { total: 0, b2b: 0, b2c: 0 },
        weight: { total: 0, b2b: 0, b2c: 0 },
        aov: { total: 0, b2b: 0, b2c: 0 },
        arpo: { total: 0, b2b: 0, b2c: 0 },
        completedSplit: { b2b: 0, b2c: 0 },
        avgBusinessInvoiceValue: 0,
        partnerPerformance: { completed: [], cancelled: [] },
        salesAgentPerformance: [],
        leadSourcePerformance: [],
        customerTypeDistribution: [],
        tat: { leadToRate: 0, rateToConfirmed: 0, confirmedToClose: 0, total: 0 }
    };
}
