import { Header } from "~/components/header/header";
import { Footer } from "~/components/footer/footer";
import { MonthlyCharts } from "~/components/monthlyCharts/monthlyCharts";
import { useUser } from "~/context/userContext";
import achievementLogo from "../../assets/img/achievement.svg";
import HeartRateChart from "../../components/heartRateCharts/heartRateCharts";
import { WeeklyCharts } from "~/components/weeklyCharts/weeklyCharts";
import { ActivityWeeklyDistance } from "~/components/activityWeeklyDistance/activityWeeklyDistance";
import { ActivityWeeklyDuration } from "~/components/activityWeeklyDuration/activityWeeklyDuration";
import {
    formatDateFr,
    getMondayOfWeek,
    getSundayOfWeek,
    toLocalDateKey,
} from "~/utils/dates";

export function Dashboard() {
    const { data, error, loading } = useUser();

    if (loading) return <p>Chargement des données...</p>;
    if (error) return <p>Erreur: {error}</p>;
    if (!data) return <p>Aucune donnée utilisateur.</p>;

    const today = new Date();
    const weekStart = getMondayOfWeek(today);
    const weekEnd = getSundayOfWeek(today);

    return (
        <main>
            <Header />
            <section className="dashboard-profil">
                <div className="dashboard-user-info">
                    <img className="dashboard-user-img" src={data.profile.profilePicture} alt="Avatar de l'utilisateur" />
                    <div className="dashboard-user-text">
                        <p className="dashboard-name">
                            {data.profile.firstName} {data.profile.lastName}
                        </p>
                        <p className="dashboard-created-at">
                            Membre depuis le {formatDateFr(data.profile.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="dashboard-statistics">
                    <p className="dashboard-total-distance-text">Distance totale parcourue</p>
                    <div className="dashboard-achievement-container">
                        <div className="dashboard-achievement">
                            <img className="dashboard-achievement-img" src={achievementLogo} alt="Icône de réussite" />
                            <p className="dashboard-total-distance">{data.statistics.totalDistance} km</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="dashboard-charts">
                <h2 className="dashboard-charts-title">Vos dernières performances</h2>
                <div className="dashboard-charts-container">
                    <MonthlyCharts />
                    <HeartRateChart />
                </div>
                <div className="dashboard-weekly-charts-header">
                    <h2 className="dashboard-charts-title">Cette semaine</h2>
                    <p>Du {formatDateFr(toLocalDateKey(weekStart))} au {formatDateFr(toLocalDateKey(weekEnd))}</p>
                </div>
                <div className="dashboard-weekly-charts-container">
                    <WeeklyCharts />
                    <div className="dashboard-weekly-stats">
                        <ActivityWeeklyDuration />
                        <ActivityWeeklyDistance />
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}