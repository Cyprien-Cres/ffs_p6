import {Link} from "react-router";
import {Logo} from "~/components/logo/logo";
import sportsee from "~/assets/img/SPORTSEE.svg";

export function NotFound() {
    return (
        <main className="notfound">
            <header className="header-logo">
                <div className="header-logo">
                    <Logo />
                    <img className="sportsee" src={sportsee} alt="SportSee" />
                </div>
                <Link to="/" className="notfound-link">
                    Retour a l'accueil
                </Link>
            </header>

            <section className="notfound-content">
                <h1>404</h1>
                <h2>Oups, cette page n'existe pas...</h2>
            </section>
        </main>
    );
}