import type { Route } from "./+types/notfound";
import { NotFound } from "~/page/notfound/notfound";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Page introuvable | SportSee" },
        { name: "description", content: "La page que vous cherchez n'existe pas." },
    ];
}

export default function NotFoundRoute() {
    return <NotFound />;
}