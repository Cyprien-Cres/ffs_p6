import { Form } from "react-router";
import loginImg from "~/assets/img/img_login.png";
import { Logo } from "~/components/logo/logo";
import sportsee from "~/assets/img/SPORTSEE.svg";

type LoginProps = {
    actionData?: {
        error?: string;
        token?: string;
        id?: string;
    };
};

export function Login({ actionData }: LoginProps) {
    return (
        <main className="home">
            <section className="login-left">
                <div className="header-logo">
                    <Logo />
                    <img className="sportsee" src={sportsee} alt="SportSee" />
                </div>
                <div className="login-left-form">
                    <h1>
                        Transformez <br /> vos stats en resultats
                    </h1>
                    <h2>Se connecter</h2>

                    <Form method="post">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                        />

                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                        />

                        <button type="submit">
                            Se connecter
                        </button>
                    </Form>

                    {actionData?.error ? <p className="login-error">{actionData.error}</p> : null}

                    <a href="">
                        <p>Mot de passe oublie ?</p>
                    </a>
                </div>
            </section>

            <img className="login-img" src={loginImg} alt="SportSee Img" />
        </main>
    );
}
