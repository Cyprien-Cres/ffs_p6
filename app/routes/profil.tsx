import type { Route } from "./+types/profil";
import { requireUserToken } from "../utils/session.server";
import { Profil as ProfilPage } from "~/page/profil/profil";


export async function loader({ request }: Route.LoaderArgs) {
    await requireUserToken(request);
    return null;
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Profil | SportSee" },
        { name: "description", content: "Profil utilisateur SportSee" },
    ];
}

export default function ProfilRoute() {
    return <ProfilPage />;
}