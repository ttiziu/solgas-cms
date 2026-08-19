"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginState = { error: null };

const inputClassName =
  "h-12 border-[#004f90]/20 bg-[#eef3f7] px-3.5 text-[15px] text-[#1a2e42] placeholder:text-[#004f90]/40 shadow-none focus-visible:border-[#e66113] focus-visible:ring-[#e66113]/25";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-[13px] font-medium text-[#004f90]">
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
          className={inputClassName}
        />
        {state.username ? (
          <p id="username-error" role="alert" className="text-sm text-[#c2410c]">
            {state.username}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-medium text-[#004f90]">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            key={state.error ?? "password"}
            aria-required="true"
            aria-invalid={!!state.password}
            aria-describedby={state.password ? "password-error" : state.error ? "login-error" : undefined}
            placeholder="••••••••"
            className={`${inputClassName} pr-12`}
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#004f90]/70 hover:bg-[#004f90]/8 hover:text-[#004f90]"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </Button>
        </div>
        {state.password ? (
          <p id="password-error" role="alert" className="text-sm text-[#c2410c]">
            {state.password}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p id="login-error" role="alert" className="text-sm text-[#c2410c]">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 bg-[#e66113] text-[#faf8f5] text-[15px] font-semibold hover:bg-[#cf5610] disabled:opacity-70"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
