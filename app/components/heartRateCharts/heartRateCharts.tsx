import { useEffect, useMemo, useState } from 'react';
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
import { useUser, type RunningSession } from '~/context/userContext';
import { parseLocalDate, getMondayOfWeek, getSundayOfWeek, toLocalDateKey } from '~/utils/dates';

const CustomLegend = () => (
    <div className="custom-legend-heartrate">
        <div className="custom-legend-content">
            <span className="custom-legend-dot"></span> Min
        </div>
        <div className="custom-legend-content">
            <span className="custom-legend-dot-orange"></span> Max BPM
        </div>
        <div className="custom-legend-content">
            <span className="custom-legend-line"></span>
            <span className="custom-legend-dot-blue"></span>
            <span className="custom-legend-line"></span>
            Max BPM
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
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
    const { fetchActivity, data: userData } = useUser();
    const [weekOffset, setWeekOffset] = useState(0);
    const [sessions, setSessions] = useState<RunningSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Fenêtre = semaine [Lun-Dim] correspondant à l'offset (0 = dernière complète)
    const { startDate, endDate } = useMemo(() => {
        const today = new Date();
        const currentMonday = getMondayOfWeek(today);
        const targetMonday = new Date(currentMonday);
        targetMonday.setDate(targetMonday.getDate() - 7 - weekOffset * 7);
        const targetSunday = getSundayOfWeek(targetMonday);
        return { startDate: targetMonday, endDate: targetSunday };
    }, [weekOffset]);

    const hasMoreOlderData = useMemo(() => {
        if (!userData?.profile.createdAt) return true;
        const createdAt = parseLocalDate(userData.profile.createdAt);
        return startDate > createdAt;
    }, [startDate, userData]);

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

    const { chartData, averageHeartRate } = useMemo(() => {
        const weekDaysTemplate = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

        const sessionsByDay = new Map<string, RunningSession>();
        for (const s of sessions) {
            sessionsByDay.set(toLocalDateKey(parseLocalDate(s.date)), s);
        }

        let sumAvg = 0;
        let countAvg = 0;

        const data = weekDaysTemplate.map((dayLabel, i) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dayData = sessionsByDay.get(toLocalDateKey(currentDate));

            if (dayData && dayData.heartRate.min && dayData.heartRate.max) {
                const dayAvg = (dayData.heartRate.min + dayData.heartRate.max) / 2;
                sumAvg += dayAvg;
                countAvg++;
                return {
                    day: dayLabel,
                    fullDate: currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
                    min: dayData.heartRate.min,
                    max: dayData.heartRate.max,
                    lineVal: dayData.heartRate.max,
                };
            }

            return {
                day: dayLabel,
                fullDate: currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
                min: null,
                max: null,
                lineVal: null,
            };
        });

        return {
            chartData: data,
            averageHeartRate: countAvg > 0 ? Math.round(sumAvg / countAvg) : 0,
        };
    }, [sessions, startDate]);

    const dateIntervalDisplay = useMemo(() => {
        const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        return `${startDate.toLocaleDateString('fr-FR', opts)} - ${endDate.toLocaleDateString('fr-FR', opts)}`;
    }, [startDate, endDate]);

    const handlePrevious = () => {
        if (hasMoreOlderData) setWeekOffset((w) => w + 1);
    };
    const handleNext = () => {
        if (weekOffset > 0) setWeekOffset((w) => w - 1);
    };

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
                            disabled={!hasMoreOlderData || loading}
                        >
                            &lt;
                        </button>
                        <span className="monthly-charts-date-range">
                            {loading ? 'Chargement...' : dateIntervalDisplay}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={weekOffset === 0 || loading}
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
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                        <XAxis
                            dataKey="day"
                            tickMargin={20}
                            tickLine={false}
                            axisLine={{ stroke: '#888' }}
                            tick={{ fill: '#707070', fontSize: 12 }}
                        />
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
                            isAnimationActive={false}
                            connectNulls={true}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}