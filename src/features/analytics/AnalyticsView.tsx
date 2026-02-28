import { useState } from 'react';
import { useUsageStats } from './hooks/useUsageStats';
import { useFeedbackStats } from './hooks/useFeedbackStats';

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="stat bg-base-100 rounded-lg border border-base-300 shadow-sm">
            <div className="stat-title text-sm">{label}</div>
            <div className="stat-value text-2xl">{value}</div>
        </div>
    );
}

function SimpleBarChart({ data, xKey, yKey, label }: { data: Record<string, any>[]; xKey: string; yKey: string; label: string }) {
    const maxVal = Math.max(...data.map(d => d[yKey]), 1);
    return (
        <div>
            <h3 className="text-sm font-semibold mb-3">{label}</h3>
            <div className="flex items-end gap-2 h-40">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                        <div
                            className="w-full bg-primary rounded-t-sm min-h-[2px] transition-all"
                            style={{ height: `${(d[yKey] / maxVal) * 100}%` }}
                        />
                        <span className="text-[10px] mt-1 text-base-content/60">{d[xKey]}</span>
                        <span className="text-[10px] font-medium">{d[yKey]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SimpleTrendChart({ data }: { data: { date: string; count: number }[] }) {
    const maxVal = Math.max(...data.map(d => d.count), 1);
    return (
        <div>
            <h3 className="text-sm font-semibold mb-3">Denní aktivní uživatelé</h3>
            <div className="flex items-end gap-[2px] h-40">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group relative">
                        <div
                            className="w-full bg-primary/80 rounded-t-sm min-h-[2px] hover:bg-primary transition-all"
                            style={{ height: `${(d.count / maxVal) * 100}%` }}
                        />
                        <div className="hidden group-hover:block absolute -top-8 bg-base-300 text-xs px-2 py-1 rounded whitespace-nowrap">
                            {d.date}: {d.count}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-base-content/50 mt-1">
                <span>{data[0]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}

export default function AnalyticsView() {
    const [days, setDays] = useState(30);
    const [semesterFilter, setSemesterFilter] = useState<string>();

    const { stats: usage, loading: usageLoading } = useUsageStats(days);
    const { stats: feedback, loading: feedbackLoading } = useFeedbackStats(semesterFilter);

    if (usageLoading || feedbackLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Usage Stats Cards */}
            <section>
                <h2 className="text-xl font-bold mb-4">Používání</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="DAU (dnes)" value={usage?.dau ?? 0} />
                    <StatCard label="WAU (7 dní)" value={usage?.wau ?? 0} />
                    <StatCard label="MAU (30 dní)" value={usage?.mau ?? 0} />
                    <StatCard label="Průměr/den" value={usage?.avgDaily30 ?? 0} />
                </div>
            </section>

            {/* Usage Charts */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Trendy</h2>
                    <select
                        className="select select-sm select-bordered"
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                    >
                        <option value={7}>7 dní</option>
                        <option value={30}>30 dní</option>
                        <option value={90}>90 dní</option>
                    </select>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        {usage?.dailyTrend && <SimpleTrendChart data={usage.dailyTrend} />}
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        {usage?.dayOfWeek && (
                            <SimpleBarChart data={usage.dayOfWeek} xKey="day" yKey="avg" label="Průměr podle dne v týdnu" />
                        )}
                    </div>
                </div>
            </section>

            {/* Feedback Results */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">NPS Hodnocení</h2>
                    <div className="flex gap-2">
                        {feedback?.semesters && feedback.semesters.length > 0 && (
                            <select
                                className="select select-sm select-bordered"
                                value={semesterFilter ?? ''}
                                onChange={e => setSemesterFilter(e.target.value || undefined)}
                            >
                                <option value="">Všechny semestry</option>
                                {feedback.semesters.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
                        {feedback?.npsDistribution && (
                            <SimpleBarChart data={feedback.npsDistribution} xKey="rating" yKey="count" label="Rozložení hodnocení" />
                        )}
                    </div>
                    <div className="bg-base-100 rounded-lg border border-base-300 p-4 flex flex-col justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary">{feedback?.avgNps ?? '-'}</div>
                            <div className="text-sm text-base-content/60 mt-1">Průměrné hodnocení</div>
                            <div className="text-sm text-base-content/60 mt-3">
                                Celkem odpovědí: <span className="font-semibold">{feedback?.totalResponses ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
