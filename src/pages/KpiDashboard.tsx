import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { KPICard } from '@/components/dashboard/KPICard';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import {
    Users,
    CheckCircle,
    XCircle,
    Repeat,
    Percent,
    Clock,
    ArrowRight,
} from 'lucide-react';
import {
    calculateBusinessMetrics,
    getDateRange,
    Period
} from '@/lib/analytics';

export default function KpiDashboard() {
    const { orders } = useOrders();
    const [dateRange, setDateRange] = useState<Period>('thisMonth');

    // Compute Metrics using Analytics Module
    const metrics = useMemo(() => {
        const range = getDateRange(dateRange);
        return calculateBusinessMetrics(orders, range);
    }, [orders, dateRange]);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Helper for Pie Charts
    const renderPieChart = (data: { name: string; value: number }[], title: string) => (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="mx-auto aspect-square max-h-[250px]">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No Data
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header & Filter */}
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="KPI Dashboard"
                        description="Business performance metrics and analytics"
                        breadcrumbs={[{ label: 'KPI Dashboard' }]}
                        showBackToDashboard={false}
                    />
                    <div className="w-[200px]">
                        <Select value={dateRange} onValueChange={(v) => setDateRange(v as Period)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="lastMonth">Last Month</SelectItem>
                                <SelectItem value="thisYear">This Year</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Top KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <KPICard title="Total Leads" value={metrics.totalLeads} icon={Users} />
                    <KPICard title="Completed Orders" value={metrics.completedOrders} icon={CheckCircle} variant="success" />
                    <KPICard title="Cancelled Orders" value={metrics.cancelledOrders} icon={XCircle} variant="destructive" />
                    <KPICard title="Repeat Orders" value={metrics.repeatOrders} icon={Repeat} variant="info" />
                    <KPICard title="Repeat Rate" value={`${metrics.repeatRate.toFixed(1)}%`} icon={Percent} variant="warning" />
                </div>

                {/* Partner Performance - Boxed Section */}
                <Card className="border-2 border-muted/50">
                    <CardHeader>
                        <CardTitle>Partner Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Completed Orders by Partner */}
                            <div className="h-[300px] flex flex-col items-center">
                                <h4 className="mb-4 text-sm font-medium text-muted-foreground">Completed Orders by Partner</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics.partnerPerformance.completed}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {metrics.partnerPerformance.completed.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Cancelled Orders by Partner */}
                            <div className="h-[300px] flex flex-col items-center">
                                <h4 className="mb-4 text-sm font-medium text-muted-foreground">Cancelled Orders by Partner</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics.partnerPerformance.cancelled}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#ff8042"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {metrics.partnerPerformance.cancelled.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3-Column Charts Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    {renderPieChart(metrics.salesAgentPerformance, "Sales Agent Performance")}
                    {renderPieChart(metrics.leadSourcePerformance, "Lead Source Performance")}
                    {renderPieChart(metrics.customerTypeDistribution, "Customer Type Distribution")}
                </div>

                {/* Turnaround Times (TAT) - Bottom Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Avg Lead → Rate TAT', value: metrics.tat.leadToRate },
                        { label: 'Avg Rate → Confirmed TAT', value: metrics.tat.rateToConfirmed },
                        { label: 'Avg Confirmed → Close TAT', value: metrics.tat.confirmedToClose },
                        { label: 'Avg Total TAT', value: metrics.tat.total },
                    ].map((tat, i) => (
                        <Card key={i}>
                            <CardContent className="flex flex-col items-center justify-center py-6">
                                <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                                <div className="text-3xl font-bold">{tat.value} <span className="text-sm font-normal text-muted-foreground">hrs</span></div>
                                <p className="text-sm font-medium text-muted-foreground mt-1 text-center">{tat.label}</p>
                                <div className="mt-4 flex items-center text-xs text-primary font-medium cursor-pointer hover:underline">
                                    See details <ArrowRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
