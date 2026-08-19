"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction, type LoginState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (state.preservedUsername) {
      setUsername(state.preservedUsername);
    }
  }, [state.preservedUsername]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-[13px] font-medium text-muted-foreground">
          Usuario
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-required="true"
          aria-invalid={!!state.username}
          aria-describedby={state.username ? "username-error" : state.error ? "login-error" : undefined}
          placeholder="Tu usuario"
          className="h-12 bg-muted/60 px-3.5 text-[15px]"
        />
        {state.username ? (
          <p id="username-error" role="alert" className="text-sm text-destructive">
            {state.username}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-muted-foreground">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={!!state.password}
            aria-describedby={state.password ? "password-error" : state.error ? "login-error" : undefined}
            placeholder="••••••••"
            className="h-12 bg-muted/60 px-3.5 pr-12 text-[15px]"
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </Button>
        </div>
        {state.password ? (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {state.password}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2 h-12 text-[15px] font-semibold">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
