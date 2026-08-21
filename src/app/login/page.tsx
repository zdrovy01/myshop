import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "MyShop trial",
};

export default function LoginPage() {
  return <LoginForm />;
}
