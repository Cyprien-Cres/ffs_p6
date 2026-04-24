import logo1 from "~/assets/logo_1.svg";
import sportsee from "~/assets/SPORTSEE.svg";
export function Logo() {
    return (
        <div className={"logo-container"}>
            <div className={"complete-logo"}>
                <img className={"logo_1"} src={logo1}></img>
            </div>
            <img className={"sportsee"} src={sportsee}></img>
        </div>
    );
}