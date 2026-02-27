import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FeedbackStats {
    npsDistribution: { rating: string; count: number }[];
    avgNps: number;
    totalResponses: number;
    faculties: string[];
    semesters: string[];
}

export function useFeedbackStats(facultyFilter?: string, semesterFilter?: string) {
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [facultyFilter, semesterFilter]);

    async function fetchStats() {
        setLoading(true);

        let query = supabase
            .from('feedback_responses')
            .select('*')
            .eq('feedback_type', 'nps');

        if (facultyFilter) query = query.eq('faculty_id', facultyFilter);
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

        // Get all faculties and semesters for filters
        const { data: allRows } = await supabase
            .from('feedback_responses')
            .select('faculty_id, semester_code')
            .eq('feedback_type', 'nps');

        const faculties = [...new Set((allRows ?? []).map(r => r.faculty_id).filter(Boolean))] as string[];
        const semesters = [...new Set((allRows ?? []).map(r => r.semester_code))].sort();

        setStats({ npsDistribution, avgNps, totalResponses: rows.length, faculties, semesters });
        setLoading(false);
    }

    return { stats, loading };
}
