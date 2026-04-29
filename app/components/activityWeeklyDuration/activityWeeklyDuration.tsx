import { useMemo } from 'react';
import { useUser } from '~/context/userContext';

export function ActivityWeeklyDuration() {
    const { activityData } = useUser();

    const totalDuration = useMemo(() => {
        if (!activityData?.runningData || activityData.runningData.length === 0) {
            return 0;
        }

        // Tri des données de la plus ancienne à la plus récente
        const sortedData = [...activityData.runningData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // On récupère la date de la dernière activité enregistrée pour créer la fenêtre de la dernière semaine
        const latestActivityDate = new Date(sortedData[sortedData.length - 1].date);

        const dayOfWeek = latestActivityDate.getDay();
        const diffToMonday = latestActivityDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

        const monday = new Date(latestActivityDate.setDate(diffToMonday));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // On isole les activités appartenant à cette semaine spécifique
        const currentWeekActivities = activityData.runningData.filter(item => {
            const itemDate = new Date(item.date).getTime();
            return itemDate >= monday.getTime() && itemDate <= sunday.getTime();
        });

        // On additionne les durées
        const sum = currentWeekActivities.reduce((acc, curr) => acc + curr.duration, 0);

        return sum;
    }, [activityData]);

    return (
        <div className="weekly-stat-container">
            <h3 className="weekly-stat-title">Durée d'activité</h3>
            <div className={"weekly-stat-text"}>
                <p className="weekly-duration-value">{Math.round(totalDuration)}</p>
                <p className="weekly-duration-unit"> minutes</p>
            </div>
        </div>
    );
}