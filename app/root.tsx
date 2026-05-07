import {
    isRouteErrorResponse, Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { UserProvider } from "~/context/userContext";
import { getSession } from "./utils/session.server";
import type { Route } from "./+types/root";
import { NotFound } from "~/page/notfound/notfound";
import "./app.css";
import {Logo} from "~/components/logo/logo";
import sportsee from "~/assets/img/SPORTSEE.svg";

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("token") ?? null;
    return { token };
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        </body>
        </html>
    );
}

export default function App({ loaderData }: Route.ComponentProps) {
    const { token } = loaderData;

    if (!token) {
        return <Outlet />;
    }

    return (
        <UserProvider token={token}>
            <Outlet />
        </UserProvider>
    );
}

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {

    if (isRouteErrorResponse(error) && error.status === 404) {
        return <NotFound />;
    }

    let message = "Oops!";
    let details = "Une erreur inattendue est survenue.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = `${error.status}`;
        details = error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
    <main className="notfound">
        <header className="header-logo">
            <div className={"header-logo"}>
                <Logo />
                <img className="sportsee" src={sportsee} alt="SportSee" />
            </div>
            <Link to="/" className="notfound-link">
                Retour a l'accueil
            </Link>
        </header>

        <section className="notfound-content">
            <h1>{message}</h1>
            <h2>{details}</h2>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </section>
    </main>
    );
}