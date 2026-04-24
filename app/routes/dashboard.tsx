import type { Route } from "./+types/dashboard";
import { Dashboard as DashboardPage } from "~/page/dashboard/dashboard";
import {requireUserToken} from "~/utils/session.server";

export async function loader({ request }: Route.LoaderArgs) {
    await requireUserToken(request);
    return null;
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Dashboard | SportSee" },
        { name: "description", content: "Tableau de bord SportSee" },
    ];
}

export default function DashboardRoute() {
    return <DashboardPage />;
}