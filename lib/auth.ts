"use server";

import { redirect } from "next/navigation";
import { getApiUrl } from "@/lib/env";
import { clearSession, setSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
  username?: string;
  password?: string;
  preservedUsername?: string;
};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username && !password) {
    return { error: null, username: "Ingresa el usuario.", password: "Ingresa la contraseña." };
  }
  if (!username) {
    return { error: null, username: "Ingresa el usuario." };
  }
  if (!password) {
    return { error: null, password: "Ingresa la contraseña.", preservedUsername: username };
  }

  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return { error: "No se pudo conectar con el servidor.", preservedUsername: username };
  }

  if (!response.ok) {
    return { error: "Usuario o contraseña incorrectos.", preservedUsername: username };
  }

  const data = (await response.json()) as { token: string; expiresIn: number };
  await setSession(data.token, data.expiresIn);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
