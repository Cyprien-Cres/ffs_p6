import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("profil", "routes/profil.tsx"),
    route("logout", "routes/logout.tsx"),
    route("*", "routes/notfound.tsx"),
] satisfies RouteConfig;