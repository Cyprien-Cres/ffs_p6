import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroySession, getSession } from "~/utils/session.server";

export async function action({ request }: Route.ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    // Redirige vers la page d'accueil (login) en détruisant le cookie
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}