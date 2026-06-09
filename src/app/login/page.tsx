"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className={styles.wrap}>
      <form action={formAction} className={styles.card}>
        <h1 className={styles.title}>Acceso al panel</h1>

        <label className={styles.label}>
          Email
          <input className={styles.input} type="email" name="email" required autoComplete="email" />
        </label>

        <label className={styles.label}>
          Contraseña
          <input
            className={styles.input}
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>

        {state?.error && <p className={styles.error}>{state.error}</p>}

        <button className={styles.button} type="submit" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
