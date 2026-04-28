import { useMemo } from 'react';
import {PieChart, Pie, ResponsiveContainer, Legend} from 'recharts';
import { useUser } from '~/context/userContext';

export function WeeklyCharts() {
    const { activityData } = useUser();

    // 1. Calcul des données de la dernière semaine réelle (Lundi - Dimanche)
    const { count, target } = useMemo(() => {
        const GOAL = 6;

        if (!activityData?.runningData || activityData.runningData.length === 0) {
            return { count: 0, target: GOAL };
        }

        const sortedData = [...activityData.runningData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const latestActivityDate = new Date(sortedData[sortedData.length - 1].date);

        const dayOfWeek = latestActivityDate.getDay();
        const diffToMonday = latestActivityDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

        const monday = new Date(latestActivityDate.setDate(diffToMonday));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const currentWeekActivities = activityData.runningData.filter(item => {
            const itemDate = new Date(item.date).getTime();
            return itemDate >= monday.getTime() && itemDate <= sunday.getTime();
        });

        return {
            count: currentWeekActivities.length,
            target: GOAL,
        };
    }, [activityData]);

    // 2. Préparation des données pour Recharts
    const remaining = Math.max(0, target - count);
    const chartData = [
        { name: 'Réalisées', value: count, fill: '#1a4edd' },
        { name: 'Restants', value: remaining, fill: '#b4c4ff' },
    ];

    const renderCustomLegend = () => {
        return (
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
    };

    return (
        <div className="weekly-chart-container">
            {/* En-tête personnalisé */}
            <div className="weekly-chart-header">
                <p className="weekly-chart-title">
                    <span className="weekly-chart-title-count">
                        x{count}
                    </span>
                    sur objectif de {target}
                </p>
                <p className="weekly-chart-subtitle">
                    Courses hebdomadaire réalisées
                </p>
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