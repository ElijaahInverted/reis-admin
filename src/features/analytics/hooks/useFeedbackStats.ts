import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FeedbackStats {
    npsDistribution: { rating: string; count: number }[];
    avgNps: number;
    totalResponses: number;
    semesters: string[];
}

export function useFeedbackStats(semesterFilter?: string) {
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [semesterFilter]);

    async function fetchStats() {
        setLoading(true);

        let query = supabase
            .from('feedback_responses')
            .select('*')
            .eq('feedback_type', 'nps');

        if (semesterFilter) query = query.eq('semester_code', semesterFilter);

        const { data: rows } = await query;
        if (!rows) { setLoading(false); return; }

        // NPS distribution (1-5)
        const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        let sum = 0;
        for (const r of rows) {
            const v = r.value;
            if (counts[v] !== undefined) {
                counts[v]++;
                sum += Number(v);
            }
        }

        const npsDistribution = Object.entries(counts).map(([rating, count]) => ({ rating, count }));
        const avgNps = rows.length > 0 ? Math.round((sum / rows.length) * 10) / 10 : 0;

        // Get all semesters for filter
        const { data: allRows } = await supabase
            .from('feedback_responses')
            .select('semester_code')
            .eq('feedback_type', 'nps');

        const semesters = [...new Set((allRows ?? []).map(r => r.semester_code))].sort();

        setStats({ npsDistribution, avgNps, totalResponses: rows.length, semesters });
        setLoading(false);
    }

    return { stats, loading };
}
