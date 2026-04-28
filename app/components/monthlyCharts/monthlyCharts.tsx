import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useUser } from '~/context/userContext';

// Composant pour personnaliser l'affichage de l'info-bulle (Tooltip) au survol
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        };

        const start = formatDate(data.startDate);
        const end = formatDate(data.endDate);
        const dateDisplay = start && end ? `${start} au ${end}` : 'Aucune date';

        return (
            <div className="custom-tooltip-container">
                <p className="custom-tooltip-date">
                    {dateDisplay}
                </p>
                <p className="custom-tooltip-distance">
                    {data.distance} km
                </p>
            </div>
        );
    }
    return null;
};

export function MonthlyCharts() {
    const { activityData } = useUser();

    // Nouvel état pour gérer le recul dans le temps par tranches de 4 semaines (28 jours)
    const [periodOffset, setPeriodOffset] = useState(0);

    // 1. Préparation dynamique des données
    const { chartData, periodEndDate, hasMoreOlderData } = useMemo(() => {
        if (!activityData?.runningData || activityData.runningData.length === 0) {
            return { chartData: [], periodEndDate: null, hasMoreOlderData: false };
        }

        const sortedData = [...activityData.runningData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const absoluteLatestDate = new Date(sortedData[sortedData.length - 1].date);
        absoluteLatestDate.setHours(23, 59, 59, 999);

        const targetEndDate = new Date(absoluteLatestDate);
        targetEndDate.setDate(targetEndDate.getDate() - (periodOffset * 28));

        const targetStartDate = new Date(targetEndDate);
        targetStartDate.setDate(targetStartDate.getDate() - 27);
        targetStartDate.setHours(0, 0, 0, 0);

        const getWeekBoundaries = (weekOffset: number) => {
            const end = new Date(targetEndDate);
            end.setDate(end.getDate() - (weekOffset * 7));
            const start = new Date(end);
            start.setDate(start.getDate() - 6); // 7 jours en incluant la fin
            return {
                startDate: start.toISOString(),
                endDate: end.toISOString()
            };
        };

        const weeks = [
            { name: 'S1', distance: 0, ...getWeekBoundaries(3) },
            { name: 'S2', distance: 0, ...getWeekBoundaries(2) },
            { name: 'S3', distance: 0, ...getWeekBoundaries(1) },
            { name: 'S4', distance: 0, ...getWeekBoundaries(0) },
        ];

        const oldestDataDate = new Date(sortedData[0].date);
        const canGoBackFurther = oldestDataDate < targetStartDate;

        sortedData.forEach((day) => {
            const dayDate = new Date(day.date);
            const diffTime = targetEndDate.getTime() - dayDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 28) {
                const weekIndex = 3 - Math.floor(diffDays / 7);

                weeks[weekIndex].distance += day.distance;
            }
        });

        const formattedChartData = weeks.map((week) => ({
            ...week,
            distance: Math.round(week.distance)
        }));

        return {
            chartData: formattedChartData,
            periodEndDate: targetEndDate,
            hasMoreOlderData: canGoBackFurther
        };
    }, [activityData, periodOffset]);

    const averageDistance = useMemo(() => {
        if (!chartData || chartData.length === 0) return 0;
        const totalDistance = chartData.reduce((acc, week) => acc + week.distance, 0);
        return Math.round(totalDistance / 4);
    }, [chartData]);

    const dateIntervalDisplay = useMemo(() => {
        if (!periodEndDate) return "Aucune donnée";

        const startDate = new Date(periodEndDate);
        startDate.setDate(startDate.getDate() - 27);

        const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

        const startStr = startDate.toLocaleDateString('fr-FR', formatOptions);
        const endStr = periodEndDate.toLocaleDateString('fr-FR', formatOptions);

        return `${startStr} - ${endStr}`;
    }, [periodEndDate]);

    // Fonctions au clic sur les flèches
    const handlePrevious = () => {
        if (hasMoreOlderData) {
            setPeriodOffset(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (periodOffset > 0) {
            setPeriodOffset(prev => prev - 1);
        }
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
                                disabled={!hasMoreOlderData}
                            >
                                &lt;
                            </button>
                            <span className="monthly-charts-date-range">{dateIntervalDisplay}</span>
                            <button
                                className="monthly-charts-nav-btn"
                                onClick={handleNext}
                                disabled={periodOffset === 0}
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
                                        style={{
                                            color: '#707070', /* 👈 Mets ICI la couleur que tu veux pour le TEXTE ("Km") */
                                            fontSize: '12px'
                                        }}
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