import logo1 from "~/assets/logo_1.svg";

export function Footer() {
    return (
        <footer>
            <div className={"footer-left"}>
                <p>©Sportsee</p>
                <p>Tous droits réservés</p>
            </div>
            <div className={"footer-right"}>
                <a>Conditions générales</a>
                <a className={"contact"}>Contact</a>
                <img className={"logo_1"} src={logo1}></img>
            </div>
        </footer>
    );
}