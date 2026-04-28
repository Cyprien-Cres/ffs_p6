import { NavLink, useSubmit } from "react-router";
import { Logo } from "../logo/logo";

export function Header() {
    const submit = useSubmit();

    const handleLogout = () => {
        // Envoie une requête POST à la route /logout de manière programmatique
        submit(null, { method: "post", action: "/logout" });
    };

    return (
        <header>
            <Logo />
            <nav>
                <li className="dashboard">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    >
                        Dashboard
                    </NavLink>
                </li>

                <li className="profil">
                    <NavLink
                        to="/profil"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    >
                        Mon profil
                    </NavLink>
                </li>

                <p>|</p>
                <li
                    className="logout"
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                >
                    Se déconnecter
                </li>
            </nav>
        </header>
    );
}