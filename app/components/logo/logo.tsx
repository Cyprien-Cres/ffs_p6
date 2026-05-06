import logo1 from "~/assets/img/logo_1.svg";
import logo2 from "~/assets/img/logo_2.svg";
export function Logo() {
    return (
        <div className="logo-container">
            <div className="complete-logo">
                <div className="logo-equalizer">
                    <img className="logo-frame logo-frame-1" src={logo1} alt="" />
                    <img className="logo-frame logo-frame-2" src={logo2} alt="" />
                </div>
            </div>
        </div>
    );
}