import { useEffect, useMemo, useState } from 'react';
import { useUser, type RunningSession } from '~/context/userContext';
import { getMondayOfWeek, getSundayOfWeek, toLocalDateKey } from '~/utils/dates';

export function ActivityWeeklyDistance() {
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

    const totalDistance = useMemo(() => {
        return sessions.reduce((acc, curr) => acc + curr.distance, 0);
    }, [sessions]);

    return (
        <div className="weekly-stat-container">
            <h3 className="weekly-stat-title">Distance</h3>
            <div className={"weekly-stat-text"}>
                <p className="weekly-distance-value">
                    {loading ? '…' : totalDistance.toFixed(2)}
                </p>
                <p className="weekly-distance-unit"> kilomètres</p>
            </div>
        </div>
    );
}