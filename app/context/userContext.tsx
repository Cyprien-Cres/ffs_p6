import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type UserProfile = {
    firstName: string;
    lastName: string;
    age: number;
    profilePicture: string;
    height: number;
    weight: number;
    createdAt: string;
};

type Statistics = {
    totalDistance: string;
    totalSessions: number;
    totalDuration: number;
};

type UserApiResponse = {
    profile: UserProfile;
    statistics: Statistics;
};

type HeartRate = {
    min: number;
    max: number;
    average: number;
};

export type RunningSession = {
    date: string;
    distance: number;
    duration: number;
    heartRate: HeartRate;
    caloriesBurned: number;
};

type UserContextValue = {
    data: UserApiResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    fetchActivity: (startWeek: string, endWeek: string) => Promise<RunningSession[]>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

const USER_INFO_URL = `${API_BASE_URL}/api/user-info`;
const USER_ACTIVITY_URL = `${API_BASE_URL}/api/user-activity`;

type UserProviderProps = {
    children: React.ReactNode;
    token: string;
};

export function UserProvider({ children, token }: UserProviderProps) {
    const [data, setData] = useState<UserApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const authHeaders = (): HeadersInit => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    });

    const fetchUserInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(USER_INFO_URL, {
                method: "GET",
                headers: authHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Erreur API (${response.status})`);
            }

            const json = (await response.json()) as UserApiResponse;
            setData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async (startWeek: string, endWeek: string): Promise<RunningSession[]> => {
        const url = new URL(USER_ACTIVITY_URL);
        url.searchParams.set("startWeek", startWeek);
        url.searchParams.set("endWeek", endWeek);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: authHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Erreur API (${response.status})`);
        }

        return (await response.json()) as RunningSession[];
    };

    useEffect(() => {
        void fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const value = useMemo(
        () => ({
            data,
            loading,
            error,
            refetch: fetchUserInfo,
            fetchActivity,
        }),
        [data, loading, error]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser doit etre utilise dans un <UserProvider>");
    }
    return context;
}