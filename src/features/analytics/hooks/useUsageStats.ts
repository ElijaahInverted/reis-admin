import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UsageStats {
    dau: number;
    wau: number;
    mau: number;
    avgDaily30: number;
    dailyTrend: { date: string; count: number }[];
    dayOfWeek: { day: string; avg: number }[];
}

const DAY_NAMES = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

export function useUsageStats(days = 30) {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [days]);

    async function fetchStats() {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

        const { data: rows } = await supabase
            .from('daily_active_usage')
            .select('student_id, usage_date')
            .gte('usage_date', startDate)
            .lte('usage_date', today);

        if (!rows) { setLoading(false); return; }

        // DAU = unique students today
        const dau = new Set(rows.filter(r => r.usage_date === today).map(r => r.student_id)).size;

        // WAU = unique students last 7 days
        const wau = new Set(rows.filter(r => r.usage_date >= weekAgo).map(r => r.student_id)).size;

        // MAU = unique students last 30 days
        const mau = new Set(rows.map(r => r.student_id)).size;

        // Daily trend: unique users per day
        const byDate: Record<string, Set<string>> = {};
        for (const r of rows) {
            if (!byDate[r.usage_date]) byDate[r.usage_date] = new Set();
            byDate[r.usage_date].add(r.student_id);
        }

        const dailyTrend = Object.entries(byDate)
            .map(([date, set]) => ({ date, count: set.size }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const avgDaily30 = dailyTrend.length > 0
            ? Math.round(dailyTrend.reduce((s, d) => s + d.count, 0) / dailyTrend.length)
            : 0;

        // Day-of-week distribution
        const dowCounts: Record<number, number[]> = {};
        for (const { date, count } of dailyTrend) {
            const dow = new Date(date + 'T00:00:00').getDay();
            if (!dowCounts[dow]) dowCounts[dow] = [];
            dowCounts[dow].push(count);
        }
        const dayOfWeek = [1, 2, 3, 4, 5, 6, 0].map(dow => ({
            day: DAY_NAMES[dow],
            avg: dowCounts[dow]
                ? Math.round(dowCounts[dow].reduce((s, v) => s + v, 0) / dowCounts[dow].length)
                : 0,
        }));

        setStats({ dau, wau, mau, avgDaily30, dailyTrend, dayOfWeek });
        setLoading(false);
    }

    return { stats, loading };
}
