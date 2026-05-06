import { useEffect, useMemo, useState } from "react";
import { Header } from "~/components/header/header";
import { Footer } from "~/components/footer/footer";
import { useUser, type RunningSession } from "~/context/userContext";
import { formatDateFr, parseLocalDate, toLocalDateKey } from "~/utils/dates";

export function Profil() {
    const { data, fetchActivity, error: userError, loading: userLoading } = useUser();
    const [sessions, setSessions] = useState<RunningSession[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState<string | null>(null);

    useEffect(() => {
        if (!data?.profile.createdAt) return;

        let cancelled = false;
        setActivityLoading(true);
        setActivityError(null);

        const startWeek = data.profile.createdAt;
        const endWeek = toLocalDateKey(new Date());

        fetchActivity(startWeek, endWeek)
            .then((sessions) => {
                if (!cancelled) setSessions(sessions);
            })
            .catch((e) => {
                if (!cancelled) {
                    setActivityError(e instanceof Error ? e.message : "Erreur inconnue");
                }
            })
            .finally(() => {
                if (!cancelled) setActivityLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [data?.profile.createdAt, fetchActivity]);

    const restDaysCount = useMemo(() => {
        if (!data?.profile.createdAt) return 0;
        return calculateRestDays(data.profile.createdAt, sessions);
    }, [data, sessions]);

    const totalCalories = useMemo(() => calculateTotalCalories(sessions), [sessions]);

    if (userLoading) return <p>Chargement des données...</p>;
    if (userError) return <p>Erreur: {userError}</p>;
    if (!data) return <p>Aucune donnée utilisateur.</p>;

    return (
        <main>
            <Header />
            <div className="profil-user-container">
                <div className="pofil-user-left">
                    <div className="profil-user-info">
                        <img
                            className="profil-user-img"
                            src={data.profile.profilePicture}
                            alt="Avatar de l'utilisateur"
                        />
                        <div className="dashboard-user-text">
                            <p className="dashboard-name">
                                {data.profile.firstName} {data.profile.lastName}
                            </p>
                            <p className="dashboard-created-at">
                                Membre depuis le {formatDateFr(data.profile.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="profil-user-detail">
                        <h3>Votre profil</h3>
                        <div className="profil-detail-line"></div>
                        <div className="profil-user-detail-text">
                            <p>Âge : {data.profile.age}</p>
                            <p>Genre : Femme</p>
                            <p>Taille : {formatHeight(data.profile.height)}</p>
                            <p>Poids : {data.profile.weight}kg</p>
                        </div>
                    </div>
                </div>
                <div className="profil-user-right">
                    <h3>Vos statistiques</h3>
                    <p className="profil-user-right-created-at">
                        depuis le {formatDateFr(data.profile.createdAt)}
                    </p>
                    <div className="profil-user-right-stats">
                        <div className="profil-user-right-stats-item">
                            <p className="profil-user-right-stats-text">Temps total courue</p>
                            <p className="profil-user-right-stats-value">
                                {formatDuration(data.statistics.totalDuration)}
                            </p>
                        </div>
                        <div className="profil-user-right-stats-item">
                            <p className="profil-user-right-stats-text">Calories brûlées</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">
                                    {activityLoading ? "…" : totalCalories}
                                </span>
                                cal
                            </p>
                        </div>
                        <div className="profil-user-right-stats-item">
                            <p className="profil-user-right-stats-text">Distance totale parcourue</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{data.statistics.totalDistance}</span>
                                km
                            </p>
                        </div>
                        <div className="profil-user-right-stats-item">
                            <p className="profil-user-right-stats-text">Nombre de jours de repos</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">
                                    {activityLoading ? "…" : restDaysCount}
                                </span>
                                jours
                            </p>
                        </div>
                        <div className="profil-user-right-stats-item">
                            <p className="profil-user-right-stats-text">Nombre de sessions</p>
                            <p className="profil-user-right-stats-value">
                                <span className="value-font-color">{data.statistics.totalSessions}</span>
                                sessions
                            </p>
                        </div>
                    </div>
                    {activityError && (
                        <p className="profil-error">Erreur de chargement des activités : {activityError}</p>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
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
                <div className="value-duration-container">
                    <span className="value-font-color">{hours}h</span> {minutes}min
                </div>
            );
        }
        return (
            <div className="value-duration-container">
                <span className="value-font-color">{hours}</span>h
            </div>
        );
    }

    return <div className="value-duration-container">{minutes}min</div>;
}

function formatHeight(heightCm: number): string {
    const meters = Math.floor(heightCm / 100);
    const cm = heightCm % 100;
    return `${meters}m${String(cm).padStart(2, "0")}`;
}

function calculateRestDays(createdAt: string, sessions: { date: string }[]): number {
    const startDate = parseLocalDate(createdAt);
    startDate.setHours(0, 0, 0, 0);

    const activeDates = sessions.map((s) => {
        const d = parseLocalDate(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    if (activeDates.length === 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - startDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const lastActivityTime = Math.max(...activeDates);

    const diffTime = lastActivityTime - startDate.getTime();
    const totalDaysToLastActivity = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const activeDaysCount = new Set(activeDates).size;

    return Math.max(0, totalDaysToLastActivity - activeDaysCount);
}

function calculateTotalCalories(sessions: { caloriesBurned: number }[]): number {
    return sessions.reduce((total, s) => total + s.caloriesBurned, 0);
}