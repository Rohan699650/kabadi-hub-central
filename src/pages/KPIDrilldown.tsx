import React, { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/dashboard/DateRangePicker';
import { calculateBusinessMetrics } from '@/lib/analytics';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KPIDrilldown() {
    const { metricId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { orders } = useOrders();

    // 1. Parse Date Range from URL or Default
    const dateRange: DateRange = useMemo(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const now = new Date();
        return {
            from: from ? parseISO(from) : startOfMonth(now),
            to: to ? parseISO(to) : endOfMonth(now),
        };
    }, [searchParams]);

    // 2. State Updater for Date Picker
    const setDateRange = (range: DateRange | undefined) => {
        if (!range) return;
        const params = new URLSearchParams(searchParams);
        if (range.from) params.set('from', range.from.toISOString());
        if (range.to) params.set('to', range.to.toISOString());
        setSearchParams(params);
    };

    // 3. Calculate Metrics
    const metrics = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return null;
        return calculateBusinessMetrics(orders, { start: dateRange.from, end: dateRange.to });
    }, [orders, dateRange]);

    // 4. Metric Config (Title, Key Accessor, Formatting)
    const metricConfig = useMemo(() => {
        if (!metrics) return null;
        switch (metricId) {
            case 'revenue':
                return {
                    title: 'Total Revenue',
                    total: metrics.revenue.total,
                    b2b: metrics.revenue.b2b,
                    b2c: metrics.revenue.b2c,
                    format: (v: number) => `₹${v.toLocaleString()}`,
                    color: '#10b981', // green
                };
            case 'gmv':
                return {
                    title: 'Gross Merchandise Value (GMV)',
                    total: metrics.gmv.total,
                    b2b: metrics.gmv.b2b,
                    b2c: metrics.gmv.b2c,
                    format: (v: number) => `₹${v.toLocaleString()}`,
                    color: '#3b82f6', // blue
                };
            case 'orders':
                return {
                    title: 'Completed Orders',
                    total: metrics.completedOrders,
                    b2b: metrics.completedSplit.b2b,
                    b2c: metrics.completedSplit.b2c,
                    format: (v: number) => v.toString(),
                    color: '#f59e0b', // amber
                };
            case 'aov':
                return {
                    title: 'Average Order Value (AOV)',
                    total: metrics.aov.total,
                    b2b: metrics.aov.b2b,
                    b2c: metrics.aov.b2c,
                    format: (v: number) => `₹${v.toFixed(0)}`,
                    color: '#8b5cf6', // purple
                };
            case 'arpo':
                return {
                    title: 'Avg Revenue Per Order (ARPO)',
                    total: metrics.arpo.total,
                    b2b: metrics.arpo.b2b,
                    b2c: metrics.arpo.b2c,
                    format: (v: number) => `₹${v.toFixed(0)}`,
                    color: '#ec4899', // pink
                };
            case 'weight':
                return {
                    title: 'Recycled Weight',
                    total: metrics.weight.total,
                    b2b: metrics.weight.b2b,
                    b2c: metrics.weight.b2c,
                    format: (v: number) => `${v.toLocaleString()} kg`,
                    color: '#06b6d4', // cyan
                };
            default:
                return null;
        }
    }, [metricId, metrics]);

    if (!metricConfig || !metrics) {
        return (
            <AdminLayout>
                <div className="flex h-screen items-center justify-center">
                    <p className="text-muted-foreground">Invalid Metric or Loading...</p>
                </div>
            </AdminLayout>
        );
    }

    // Chart Data
    const barData = [
        { name: 'Overall', value: metricConfig.total },
        { name: 'B2B', value: metricConfig.b2b },
        { name: 'B2C', value: metricConfig.b2c },
    ];

    const pieData = [
        { name: 'B2B', value: metricConfig.b2b },
        { name: 'B2C', value: metricConfig.b2c },
    ].filter(d => d.value > 0);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header & Filter */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate('/kpi')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <PageHeader
                            title={metricConfig.title}
                            description="Detailed breakdown of performance metrics"
                            breadcrumbs={[
                                { label: 'KPI Dashboard', href: '/kpi' },
                                { label: metricConfig.title }
                            ]}
                            showBackToDashboard={false}
                        />
                    </div>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>

                {/* Cards Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total (Overall)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metricConfig.format(metricConfig.total)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                B2B Segment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metricConfig.format(metricConfig.b2b)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metricConfig.total > 0 ? ((metricConfig.b2b / metricConfig.total) * 100).toFixed(1) : 0}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                B2C Segment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metricConfig.format(metricConfig.b2c)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metricConfig.total > 0 ? ((metricConfig.b2c / metricConfig.total) * 100).toFixed(1) : 0}% of total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Metric Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => metricConfig.format(value)} />
                                    <Bar dataKey="value" fill={metricConfig.color} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>B2B vs B2C Split</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px]">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => metricConfig.format(value)} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No Data to Display
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
