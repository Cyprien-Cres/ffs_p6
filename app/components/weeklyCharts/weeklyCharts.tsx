import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, ResponsiveContainer, Legend } from 'recharts';
import { useUser, type RunningSession } from '~/context/userContext';
import { getMondayOfWeek, getSundayOfWeek, toLocalDateKey } from '~/utils/dates';

const WEEKLY_GOAL = 6;

export function WeeklyCharts() {
    const { fetchActivity } = useUser();
    const [sessions, setSessions] = useState<RunningSession[]>([]);
    const [loading, setLoading] = useState(true);

    const { startDate, endDate } = useMemo(() => {
        const today = new Date();
        const monday = getMondayOfWeek(today);
        const sunday = getSundayOfWeek(today);
        return { startDate: monday, endDate: sunday };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        fetchActivity(toLocalDateKey(startDate), toLocalDateKey(endDate))
            .then((data) => {
                if (!cancelled) setSessions(data);
            })
            .catch(() => {
                if (!cancelled) setSessions([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [startDate, endDate, fetchActivity]);

    const count = sessions.length;
    const target = WEEKLY_GOAL;
    const remaining = Math.max(0, target - count);

    const chartData = [
        { name: 'Réalisées', value: count, fill: '#1a4edd' },
        { name: 'Restants', value: remaining, fill: '#b4c4ff' },
    ];

    const renderCustomLegend = () => (
        <div className="weekly-chart-legend">
            <div className="weekly-chart-legend-done">
                <span className="weekly-chart-legend-dot-done"></span>
                <span className="weekly-chart-legend-text">{chartData[0].value} {chartData[0].name.toLowerCase()}</span>
            </div>
            <div className="weekly-chart-legend-remaining">
                <span className="weekly-chart-legend-dot-remaining"></span>
                <span className="weekly-chart-legend-text">{chartData[1].value} {chartData[1].name.toLowerCase()}</span>
            </div>
        </div>
    );

    return (
        <div className="weekly-chart-container">
            <div className="weekly-chart-header">
                <p className="weekly-chart-title">
                    <span className="weekly-chart-title-count">x{loading ? '…' : count}</span>
                    sur objectif de {target}
                </p>
                <p className="weekly-chart-subtitle">Courses hebdomadaire réalisées</p>
            </div>
            <div className="weekly-chart-graphic">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            startAngle={150}
                            endAngle={360 + 150}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        />
                        <Legend content={renderCustomLegend} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}