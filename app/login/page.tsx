import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#f0f4f8] px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-[#004f90]/12 bg-[#faf8f5] p-8 shadow-[0_12px_40px_-24px_rgba(0,79,144,0.35)]">
        <div className="flex justify-center px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo.svg"
            alt="Solgas"
            width={280}
            height={80}
            className="h-16 w-auto max-w-full object-contain sm:h-20"
          />
        </div>
        <h1 className="sr-only">Iniciar sesión</h1>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
