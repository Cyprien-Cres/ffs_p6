import { useMemo } from 'react';
import { useUser } from '~/context/userContext';

export function ActivityWeeklyDistance() {
    const { activityData } = useUser();

    const totalDistance = useMemo(() => {
        if (!activityData?.runningData || activityData.runningData.length === 0) {
            return 0;
        }

        // Tri des données de la plus ancienne à la plus récente
        const sortedData = [...activityData.runningData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // On récupère la date de la dernière activité enregistrée pour définir la dernière semaine réelle
        const latestActivityDate = new Date(sortedData[sortedData.length - 1].date);

        const dayOfWeek = latestActivityDate.getDay();
        const diffToMonday = latestActivityDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

        const monday = new Date(latestActivityDate.setDate(diffToMonday));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // On filtre uniquement les activités de cette semaine
        const currentWeekActivities = activityData.runningData.filter(item => {
            const itemDate = new Date(item.date).getTime();
            return itemDate >= monday.getTime() && itemDate <= sunday.getTime();
        });

        // On additionne la distance de toutes les sessions de cette semaine
        const sum = currentWeekActivities.reduce((acc, curr) => acc + curr.distance, 0);

        return sum;
    }, [activityData]);

    return (
        <div className="weekly-stat-container">
            <h3 className="weekly-stat-title">Distance</h3>
            <div className={"weekly-stat-text"}>
                <p className="weekly-distance-value">{totalDistance.toFixed(2)}</p>
                <p className="weekly-distance-unit"> kilomètres</p>
            </div>
        </div>
    );
}