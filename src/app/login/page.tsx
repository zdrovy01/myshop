import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Zaloguj się — MyShop by zdrovy",
};

export default function LoginPage() {
  return <LoginForm />;
}
