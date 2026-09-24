"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert } from "@/components/auth/FormAlert";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  completeProfile,
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type FormState,
} from "@/lib/auth/actions";
import { PASSWORD_MIN, USERNAME_MAX, USERNAME_PATTERN } from "@/lib/auth/validation";

const initialState: FormState = {};

const linkStyle = "text-accent-soft underline underline-offset-4 hover:text-primary";

function UsernameInput({ error, defaultValue }: { error?: string; defaultValue?: string }) {
  return (
    <Input
      label="Kullanıcı adı"
      name="username"
      required
      autoComplete="username"
      autoCapitalize="none"
      spellCheck={false}
      maxLength={USERNAME_MAX}
      pattern={USERNAME_PATTERN}
      title="3–20 karakter; küçük harf, rakam ve alt çizgi"
      hint="3–20 karakter; küçük harf, rakam ve alt çizgi (_)."
      error={error}
      defaultValue={defaultValue}
    />
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <input type="hidden" name="next" value={next} />
      <Input
        label="E-posta"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <div className="flex flex-col gap-2">
        <Input
          label="Şifre"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          error={state.fieldErrors?.password}
        />
        <Link href="/forgot-password" className={`self-end text-sm ${linkStyle}`}>
          Şifremi unuttum
        </Link>
      </div>
      <Button type="submit" fullWidth loading={pending}>
        Giriş yap
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, initialState);

  if (state.success) {
    return <FormAlert tone="success">{state.success}</FormAlert>;
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <UsernameInput error={state.fieldErrors?.username} defaultValue={state.values?.username} />
      <Input
        label="E-posta"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <Input
        label="Şifre"
        name="password"
        type="password"
        required
        minLength={PASSWORD_MIN}
        autoComplete="new-password"
        hint={`En az ${PASSWORD_MIN} karakter.`}
        error={state.fieldErrors?.password}
      />
      <TermsCheckbox error={state.fieldErrors?.terms} />
      <Button type="submit" fullWidth loading={pending}>
        Kayıt ol
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return <FormAlert tone="success">{state.success}</FormAlert>;
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <Input
        label="E-posta"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <Button type="submit" fullWidth loading={pending}>
        Sıfırlama bağlantısı gönder
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <Input
        label="Yeni şifre"
        name="password"
        type="password"
        required
        minLength={PASSWORD_MIN}
        autoComplete="new-password"
        hint={`En az ${PASSWORD_MIN} karakter.`}
        error={state.fieldErrors?.password}
      />
      <Input
        label="Yeni şifre (tekrar)"
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        error={state.fieldErrors?.confirm}
      />
      <Button type="submit" fullWidth loading={pending}>
        Şifreyi kaydet
      </Button>
    </form>
  );
}

export function WelcomeForm({ next, username }: { next: string; username: string | null }) {
  const [state, action, pending] = useActionState(completeProfile, initialState);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <input type="hidden" name="next" value={next} />
      {username ? (
        // Kullanıcı adı zaten seçilmiş; sadece koşullar onaylanır.
        <input type="hidden" name="username" value={username} />
      ) : (
        <UsernameInput error={state.fieldErrors?.username} defaultValue={state.values?.username} />
      )}
      <TermsCheckbox error={state.fieldErrors?.terms} />
      <Button type="submit" fullWidth loading={pending}>
        Devam et
      </Button>
    </form>
  );
}
