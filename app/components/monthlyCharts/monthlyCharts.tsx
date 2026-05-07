import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useUser, type RunningSession } from '~/context/userContext';
import { parseLocalDate, getMondayOfWeek, toLocalDateKey } from '~/utils/dates';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        };
        const start = formatDate(data.startDate);
        const end = formatDate(data.endDate);
        const dateDisplay = start && end ? `${start} au ${end}` : 'Aucune date';

        return (
            <div className="custom-tooltip-container">
                <p className="custom-tooltip-date">{dateDisplay}</p>
                <p className="custom-tooltip-distance">{data.distance} km</p>
            </div>
        );
    }
    return null;
};

export function MonthlyCharts() {
    const { fetchActivity, data: userData } = useUser();

    const [periodOffset, setPeriodOffset] = useState(0);
    const [sessions, setSessions] = useState<RunningSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { startDate, endDate } = useMemo(() => {
        const today = new Date();
        const currentMonday = getMondayOfWeek(today);

        const lastDisplayedMonday = new Date(currentMonday);
        lastDisplayedMonday.setDate(lastDisplayedMonday.getDate() - 7);

        lastDisplayedMonday.setDate(lastDisplayedMonday.getDate() - periodOffset * 28);

        const firstDisplayedMonday = new Date(lastDisplayedMonday);
        firstDisplayedMonday.setDate(firstDisplayedMonday.getDate() - 21);

        const end = new Date(lastDisplayedMonday);
        end.setDate(end.getDate() + 6);

        return { startDate: firstDisplayedMonday, endDate: end };
    }, [periodOffset]);

    const hasMoreOlderData = useMemo(() => {
        if (!userData?.profile.createdAt) return true;
        const createdAt = parseLocalDate(userData.profile.createdAt);
        return startDate > createdAt;
    }, [startDate, userData]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchActivity(toLocalDateKey(startDate), toLocalDateKey(endDate))
            .then((data) => {
                if (!cancelled) setSessions(data);
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur inconnue');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [startDate, endDate, fetchActivity]);

    const chartData = useMemo(() => {
        const weeks = Array.from({ length: 4 }, (_, i) => {
            const monday = new Date(startDate);
            monday.setDate(startDate.getDate() + i * 7);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return {
                name: `S${i + 1}`,
                distance: 0,
                startDate: monday.toISOString(),
                endDate: sunday.toISOString(),
                mondayKey: toLocalDateKey(monday),
            };
        });

        sessions.forEach((s) => {
            const sessionDate = parseLocalDate(s.date);
            const sessionMonday = getMondayOfWeek(sessionDate);
            const sessionMondayKey = toLocalDateKey(sessionMonday);
            const week = weeks.find((w) => w.mondayKey === sessionMondayKey);
            if (week) week.distance += s.distance;
        });

        return weeks.map((w) => ({ ...w, distance: Math.round(w.distance) }));
    }, [sessions, startDate]);

    const averageDistance = useMemo(() => {
        if (chartData.length === 0) return 0;
        const total = chartData.reduce((acc, w) => acc + w.distance, 0);
        return Math.round(total / 4);
    }, [chartData]);

    const dateIntervalDisplay = useMemo(() => {
        const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${startDate.toLocaleDateString('fr-FR', opts)} - ${endDate.toLocaleDateString('fr-FR', opts)}`;
    }, [startDate, endDate]);

    const handlePrevious = () => {
        if (hasMoreOlderData) setPeriodOffset((p) => p + 1);
    };

    const handleNext = () => {
        if (periodOffset > 0) setPeriodOffset((p) => p - 1);
    };

    return (
        <section className="dashboard-monthly-charts">
            <div className="monthly-charts-wrapper">
                <div className="monthly-charts-header">
                    <div className="monthly-charts-titles">
                        <h2 className="monthly-charts-average">{averageDistance}km en moyenne</h2>
                        <div className="monthly-charts-navigation">
                            <button
                                className="monthly-charts-nav-btn"
                                onClick={handlePrevious}
                                disabled={!hasMoreOlderData || loading}
                            >
                                &lt;
                            </button>
                            <span className="monthly-charts-date-range">
                                {loading ? 'Chargement...' : error ? 'Erreur' : dateIntervalDisplay}
                            </span>
                            <button
                                className="monthly-charts-nav-btn"
                                onClick={handleNext}
                                disabled={periodOffset === 0 || loading}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                    <p className="monthly-charts-subtitle">Total des kilomètres 4 dernières semaines</p>
                </div>
                <div className="monthly-charts-graph-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 15, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: '#8c8c8c' }}
                                tickLine={false}
                                tick={{ fill: '#7b7b7b', fontSize: 12, dy: 15 }}
                            />
                            <YAxis
                                axisLine={{ stroke: '#8c8c8c' }}
                                tickLine={false}
                                tick={{ fill: '#7b7b7b', fontSize: 12, dx: -10 }}
                                ticks={[0, 10, 20, 30]}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0)' }} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ bottom: -0, left: -88 }}
                                formatter={(value) => (
                                    <span
                                        className="monthly-charts-legend-text"
                                        style={{ color: '#707070', fontSize: '12px' }}
                                    >
                                        {value}
                                    </span>
                                )}
                            />
                            <Bar
                                dataKey="distance"
                                name="Km"
                                fill="#B6BDFC"
                                barSize={14}
                                radius={[30, 30, 30, 30]}
                                activeBar={{ fill: '#0B23F4' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}