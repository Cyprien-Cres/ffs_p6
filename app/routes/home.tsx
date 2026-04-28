import type { Route } from "./+types/home";
import {redirect, useActionData} from "react-router";
import { Login } from "~/page/login/login";
import {commitSession, getSession} from "~/utils/session.server";

type LoginActionData = {
  error?: string;
  token?: string;
  id?: string;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Connexion | SportSee" },
    { name: "description", content: "Connecte-toi a ton espace SportSee" },
  ];
}

export async function action({ request }: Route.ActionArgs): Promise<LoginActionData | ReturnType<typeof redirect>> {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username et mot de passe requis." };
  }

  try {
    const response = await fetch(
        "https://2c26f4f1-d38c-41cc-9a75-8ec8df2d0e0c.mock.pstmn.io/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
    );

    if (!response.ok) {
      return { error: `Echec de connexion (${response.status}).` };
    }

    const data = (await response.json()) as { token?: string; id?: string };

    if (!data.token || !data.id) {
      return { error: "Reponse API invalide (token/id manquant)." };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.token);
    session.set("userId", data.id);

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });

  } catch {
    return { error: "Impossible de joindre le serveur de connexion." };
  }
}

export default function Home() {
  const actionData = useActionData<typeof action>();

  return <Login actionData={actionData} />;
}
