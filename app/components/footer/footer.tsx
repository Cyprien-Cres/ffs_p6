import { Logo } from "../logo/logo"

export function Footer() {
    return (
        <footer>
            <div className="footer-left">
                <p>©Sportsee</p>
                <p>Tous droits réservés</p>
            </div>
            <div className="footer-right">
                <a>Conditions générales</a>
                <a className="contact">Contact</a>
                <Logo />
            </div>
        </footer>
    );
}