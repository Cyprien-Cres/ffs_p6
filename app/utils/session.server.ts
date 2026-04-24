import { createCookieSessionStorage, redirect } from "react-router";

type SessionData = {
    token: string;
    userId: string;
};

type SessionFlashData = {
    error: string;
};

const sessionStorage = createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        // En prod: mets une vraie secret via variable d'env
        secrets: [process.env.SESSION_SECRET ?? "dev-secret-a-changer"],
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24h
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function requireUserToken(request: Request) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token");

    if (!token) {
        throw redirect("/");
    }

    return token;
}