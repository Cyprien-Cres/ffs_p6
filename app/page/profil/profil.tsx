import { Header } from "~/components/header/header";
import {Footer} from "~/components/footer/footer";
import { useUser } from "~/context/userContext";
import avatar from "~/assets/sophie.jpg";
import {data} from "react-router";

export function Profil() {
    const { data, activityData, error, loading } = useUser();

    if (loading) return <p>Chargement des données...</p>;
    if (error) return <p>Erreur: {error}</p>;
    if (!data) return <p>Aucune donnée utilisateur.</p>;
    if (!activityData) return <p>Aucune donnée d'activité.</p>;

    const restDaysCount = calculateRestDays(data.userInfos.createdAt, activityData.runningData);
    const totalCalories = calculateTotalCalories(activityData.runningData);

    return (
        <main>
            <Header />
            <div className="profil-user-container">
                <div className="pofil-user-left">
                    <div className={"profil-user-info"}>
                        <img className={"profil-user-img"} src={avatar} alt="Avatar de l'utilisateur" />
                        <div className={"dashboard-user-text"}>
                            <p className={"dashboard-name"}> {data.userInfos.firstName} {data.userInfos.lastName} </p>
                            <p className={"dashboard-created-at"}> Membre depuis le {formatDateFr(data.userInfos.createdAt)} </p>
                        </div>
                    </div>
                    <div className="profil-user-detail">
                        <h3>Votre profil</h3>
                        <div className="profil-detail-line"></div>
                        <div className="profil-user-detail-text">
                            <p>Âge : {data.userInfos.age}</p>
                            <p>Genre : {data.userInfos.gender}</p>
                            <p>Taille : {data.userInfos.height}</p>
                            <p>Poids : {data.userInfos.weight}</p>
                        </div>
                    </div>
                </div>
                <div className="profil-user-right">
                    <h3>Vos statistiques</h3>
                    <p className="profil-user-right-created-at">depuis le {formatDateFr(data.userInfos.createdAt)}</p>
                    <div className="profil-user-right-stats">
                        <div className={"profil-user-right-stats-item"}>
                            <p className="profil-user-right-stats-text">Temps total courue</p>
                            <p className="profil-user-right-stats-value">{formatDuration(data.statistics.totalDuration)}</p>
                        </div>
                        <div className={"profil-user-right-stats-item"}>
                            <p className="profil-user-right-stats-text">Calories brûlées</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{totalCalories}</span>
                                cal
                            </p>
                        </div>
                        <div className={"profil-user-right-stats-item"}>
                            <p className="profil-user-right-stats-text">Distance totale parcourue</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{data.statistics.totalDistance}</span>
                                km
                            </p>
                        </div>
                        <div className={"profil-user-right-stats-item"}>
                            <p className="profil-user-right-stats-text">Nombre de jours de repos</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{restDaysCount}</span>
                                jours
                            </p>
                        </div>
                        <div className={"profil-user-right-stats-item"}>
                            <p className="profil-user-right-stats-text">Nombre de sessions</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{data.statistics.totalSessions}</span>
                                sessions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function formatDateFr(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatDuration(totalMinutes: number) {
    if (!totalMinutes) {
        return (
            <>
                <span className="value-font-color">0</span> min
            </>
        );
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        if (minutes > 0) {
            return (
                <div className={"value-duration-container"}>
                    <span className="value-font-color">{hours}h</span>{" "}
                    {minutes}min
                </div>
            );
        }
        return (
            <div className={"value-duration-container"}>
                <span className="value-font-color">{hours}</span>h
            </div>
        );
    }

    return (
        <div className={"value-duration-container"}>
            {minutes}min
        </div>
    );
}

function calculateRestDays(createdAt: string, runningData: { date: string }[]): number {
    const startDate = new Date(createdAt);
    startDate.setHours(0, 0, 0, 0);

    // On récupère toutes les dates d'activité
    const activeDates = runningData.map((activity) => {
        const d = new Date(activity.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    // Si aucune activité, tous les jours jusqu'à aujourd'hui sont des jours sans activité
    if (activeDates.length === 0) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const diffTime = currentDate.getTime() - startDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // On utilise la date de la toute dernière activité enregistrée comme point de fin
    const lastActivityTime = Math.max(...activeDates);

    // Calcul du nombre de jours total entre l'inscription et la dernière activité
    const diffTime = lastActivityTime - startDate.getTime();
    const totalDaysToLastActivity = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Nombre de jours d'activité uniques
    const activeDaysCount = new Set(activeDates).size;

    // Nombre de jours SANS activité = Jours totaux - Jours AVEC activité
    return Math.max(0, totalDaysToLastActivity - activeDaysCount);
}

function calculateTotalCalories(runningData: { caloriesBurned: number }[]): number {
    // La méthode reduce va parcourir chaque activité et additionner les calories
    return runningData.reduce((total, activity) => total + activity.caloriesBurned, 0);
}