import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { useUser } from '~/context/userContext';

// Légende personnalisée pour correspondre au design
const CustomLegend = () => {
    return (
        <div className="custom-legend-heartrate">
            <div className="custom-legend-content">
                <span className="custom-legend-dot"></span>
                Min
            </div>
            <div className="custom-legend-content">
                <span className="custom-legend-dot-orange"></span>
                Max BPM
            </div>
            <div className="custom-legend-content">
                <span className="custom-legend-line"></span>
                <span className="custom-legend-dot-blue"></span>
                <span className="custom-legend-line"></span>
                Max BPM
            </div>
        </div>
    );
};

// Tooltip personnalisé (optionnel, adaptatif)
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // On n'affiche rien s'il n'y a pas de vraies données
        if (data.min === null) return null;

        return (
            <div className="custom-tooltip-container">
                <p className="custom-tooltip-date">{data.fullDate}</p>
                <p className="custom-tooltip-distance">Min : {data.min} BPM</p>
                <p className="custom-tooltip-distance">Max : {data.max} BPM</p>
            </div>
        );
    }
    return null;
};

export default function HeartRateCharts() {
    const { activityData } = useUser();
    const [weekOffset, setWeekOffset] = useState(0);

    // 1. Préparation dynamique des données (du lundi au dimanche)
    const { chartData, periodEndDate, hasMoreOlderData, averageHeartRate } = useMemo(() => {
        if (!activityData?.runningData || activityData.runningData.length === 0) {
            return { chartData: [], periodEndDate: null, hasMoreOlderData: false, averageHeartRate: 0 };
        }

        const sortedData = [...activityData.runningData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Trouver le dernier jour des données
        const absoluteLatestDate = new Date(sortedData[sortedData.length - 1].date);

        // Aligner sur le dimanche de cette semaine-là (0 = Dimanche, 1 = Lundi...)
        const dayOfWeek = absoluteLatestDate.getDay();
        const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

        const absoluteSunday = new Date(absoluteLatestDate);
        absoluteSunday.setDate(absoluteLatestDate.getDate() + diffToSunday);
        absoluteSunday.setHours(23, 59, 59, 999);

        // Appliquer l'offset (recul de N semaines)
        const targetEndDate = new Date(absoluteSunday);
        targetEndDate.setDate(targetEndDate.getDate() - (weekOffset * 7));

        const targetStartDate = new Date(targetEndDate);
        targetStartDate.setDate(targetStartDate.getDate() - 6); // Reste 6 jours pour aller jusqu'au lundi
        targetStartDate.setHours(0, 0, 0, 0);

        // Jours de la semaine ciblés
        const weekDaysTemplate = [
            { day: 'Lun', dateOffset: 0 },
            { day: 'Mar', dateOffset: 1 },
            { day: 'Mer', dateOffset: 2 },
            { day: 'Jeu', dateOffset: 3 },
            { day: 'Ven', dateOffset: 4 },
            { day: 'Sam', dateOffset: 5 },
            { day: 'Dim', dateOffset: 6 },
        ];

        let sumAvg = 0;
        let countAvg = 0;

        const formattedChartData = weekDaysTemplate.map((dayTemplate) => {
            const currentDate = new Date(targetStartDate);
            currentDate.setDate(currentDate.getDate() + dayTemplate.dateOffset);
            const dateString = currentDate.toISOString().split('T')[0];

            // Trouver la donnée de ce jour spécifique existante dans runningData
            const dayData = sortedData.find(d => new Date(d.date).toISOString().split('T')[0] === dateString);

            if (dayData && dayData.heartRate.min && dayData.heartRate.max) {
                // S'il y a des données pour le jour, on l'incorpore au calcul de la moyenne globale
                const dayAverage = (dayData.heartRate.min + dayData.heartRate.max) / 2;
                sumAvg += dayAverage;
                countAvg++;

                return {
                    day: dayTemplate.day,
                    fullDate: currentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" }),
                    min: dayData.heartRate.min,
                    max: dayData.heartRate.max,
                    lineVal: dayData.heartRate.max // Ligne connectée au max
                };
            }

            // Pas de données pour cette journée en particulier
            return {
                day: dayTemplate.day,
                fullDate: currentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" }),
                min: null,
                max: null,
                lineVal: null
            };
        });

        const oldestDataDate = new Date(sortedData[0].date);
        const canGoBackFurther = oldestDataDate < targetStartDate;

        return {
            chartData: formattedChartData,
            periodEndDate: targetEndDate,
            hasMoreOlderData: canGoBackFurther,
            averageHeartRate: countAvg > 0 ? Math.round(sumAvg / countAvg) : 0
        };
    }, [activityData, weekOffset]);

    // Formatage de la date à afficher en haut à droite (ex: "28 mai - 04 juin")
    const dateIntervalDisplay = useMemo(() => {
        if (!periodEndDate) return "Aucune donnée";

        const startDate = new Date(periodEndDate);
        startDate.setDate(startDate.getDate() - 6);

        const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        return `${startDate.toLocaleDateString('fr-FR', formatOptions)} - ${periodEndDate.toLocaleDateString('fr-FR', formatOptions)}`;
    }, [periodEndDate]);

    // Fonctions de navigation
    const handlePrevious = () => { if (hasMoreOlderData) setWeekOffset(prev => prev + 1); };
    const handleNext = () => { if (weekOffset > 0) setWeekOffset(prev => prev - 1); };

    return (
            <section className="dashboard-heartrate-charts">
                <div className="monthly-charts-header">
                    <div className="monthly-charts-titles">
                        <h2 className="monthly-charts-average-orange">
                            {averageHeartRate > 0 ? `${averageHeartRate} BPM` : '-- BPM'}
                        </h2>
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
                                onClick={handleNext}
                                disabled={weekOffset === 0}
                                className="monthly-charts-nav-btn"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                    <p className="monthly-charts-subtitle">Fréquence cardiaque moyenne</p>
                </div>
                <div className="heartrate-charts-graph-container">
                <ResponsiveContainer>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />

                        <XAxis
                            dataKey="day"
                            tickMargin={20}
                            tickLine={false}
                            axisLine={{ stroke: '#888' }}
                            tick={{ fill: '#707070', fontSize: 12 }}
                        />

                        {/* Domain min à 60 au cas où, à adapter selon vos vraies données (ex: ['dataMin - 10', 'dataMax + 10']) */}
                        <YAxis
                            domain={[130, 187]}
                            ticks={[130, 145, 160, 187]}
                            tickLine={false}
                            axisLine={{ stroke: '#888' }}
                            tick={{ fill: '#707070', fontSize: 10 }}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />

                        <Legend content={<CustomLegend />} wrapperStyle={{ bottom: -20 }} />

                        <Bar dataKey="min" fill="#FCC1B6" radius={[10, 10, 0, 0]} barSize={16} />
                        <Bar dataKey="max" fill="#F4320B" radius={[10, 10, 0, 0]} barSize={16} />

                        <Line
                            type="monotone"
                            dataKey="lineVal"
                            stroke="#eaefff"
                            strokeWidth={4}
                            dot={{ fill: '#183cf0', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={false} // Désactivé si des "nulls" posent problème au rendu anime
                            connectNulls={true} // Permet de relier la ligne si vous avez 1 jour sans donnée au milieu de la semaine
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}