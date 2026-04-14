import type { Route } from "./+types/home";
import { Login } from "~/login/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sportsee - Login" },
    { name: "login", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Login />;
}
