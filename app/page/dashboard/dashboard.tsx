import { Header } from "~/components/header/header";
import { Footer } from "~/components/footer/footer";
import { MonthlyCharts } from "~/components/monthlyCharts/monthlyCharts";
import { useUser } from "~/context/userContext";
import avatar from "../../assets/sophie.jpg";
import achievementLogo from "../../assets/achievement.svg";
import HeartRateChart from "../../components/heartRateCharts/heartRateCharts";
import {WeeklyCharts} from "~/components/weeklyCharts/weeklyCharts";
import {ActivityWeeklyDistance} from "~/components/activityWeeklyDistance/activityWeeklyDistance";
import {ActivityWeeklyDuration} from "~/components/activityWeeklyDuration/activityWeeklyDuration";
export function Dashboard() {
    const { data, activityData, error, loading } = useUser();

    if (loading) return <p>Chargement des données...</p>;
    if (error) return <p>Erreur: {error}</p>;
    if (!data) return <p>Aucune donnée utilisateur.</p>;
    if (!activityData) return <p>Aucune donnée d'activité.</p>;

    return (
        <main>
            <Header />
                <section className={"dashboard-profil"}>
                    <div className={"dashboard-user-info"}>
                        <img className={"dashboard-user-img"} src={avatar} alt="Avatar de l'utilisateur" />
                        <div className={"dashboard-user-text"}>
                            <p className={"dashboard-name"}> {data.userInfos.firstName} {data.userInfos.lastName} </p>
                            <p className={"dashboard-created-at"}> Membre depuis le {formatDateFr(data.userInfos.createdAt)} </p>
                        </div>
                    </div>
                    <div className={"dashboard-statistics"}>
                        <p className={"dashboard-total-distance-text"}>Distance totale parcourue</p>
                        <div className={"dashboard-achievement-container"}>
                            <div className={"dashboard-achievement"}>
                                <img className={"dashboard-achievement-img"} src={achievementLogo} alt="Icône de réussite" />
                                <p className={"dashboard-total-distance"}>{data.statistics.totalDistance} km</p>
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

function formatDateFr(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}