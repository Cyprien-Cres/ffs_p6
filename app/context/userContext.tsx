import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserInfo = {
    firstName: string;
    lastName: string;
    age: number;
    gender: "female" | "male" | string;
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
    userInfos: UserInfo;
    statistics: Statistics;
};

type HeartRate = {
    min: number;
    max: number;
    average: number;
};

type RunningData = {
    date: string;
    distance: number;
    duration: number;
    heartRate: HeartRate;
    caloriesBurned: number;
};

type UserActivityApiResponse = {
    runningData: RunningData[];
};

type UserContextValue = {
    data: UserApiResponse | null;
    activityData: UserActivityApiResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    refetchActivity: (startDate: string, endDate: string) => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

const USER_INFO_URL =
    "https://2c26f4f1-d38c-41cc-9a75-8ec8df2d0e0c.mock.pstmn.io/api/user-info";

const USER_ACTIVITY_URL =
    "https://2c26f4f1-d38c-41cc-9a75-8ec8df2d0e0c.mock.pstmn.io/api/user-activity";

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<UserApiResponse | null>(null);
    const [activityData, setActivityData] = useState<UserActivityApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(USER_INFO_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
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

    const fetchUserActivity = async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);

        try {
            const url = new URL(USER_ACTIVITY_URL);
            url.searchParams.set("startDate", startDate);
            url.searchParams.set("endDate", endDate);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Erreur API (${response.status})`);
            }

            const json = (await response.json()) as UserActivityApiResponse;
            setActivityData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUserInfo();
        void fetchUserActivity("2025-01-01", "2025-12-31");
    }, []);

    const value = useMemo(
        () => ({
            data,
            activityData,
            loading,
            error,
            refetch: fetchUserInfo,
            refetchActivity: fetchUserActivity,
        }),
        [data, activityData, loading, error]
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