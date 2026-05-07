import type { Route } from "./+types/home";
import { redirect, useActionData } from "react-router";
import { Login } from "~/page/login/login";
import { commitSession, getSession } from "~/utils/session.server";

type LoginActionData = {
  error?: string;
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

  if (!username) {
    return { error: "Nom d'utilisateur requis." };
  }

  if (!password) {
    return { error: "Mot de passe requis." };
  }

  const apiUrl = process.env.API_URL ?? "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Identifiants invalides." };
      }
      return { error: `Echec de connexion (${response.status}).` };
    }

    const data = (await response.json()) as {
      token?: string;
      userId?: string | number;
    };

    if (!data.token || data.userId === undefined || data.userId === null) {
      return { error: "Reponse API invalide (token/userId manquant)." };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.token);
    session.set("userId", String(data.userId));

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    console.error("[login action] fetch error:", err);
    return { error: "Impossible de joindre le serveur de connexion." };
  }
}

export default function Home() {
  const actionData = useActionData<typeof action>();
  return <Login actionData={actionData} />;
}