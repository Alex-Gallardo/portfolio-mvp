"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button/Button";
import { track } from "@/features/analytics/tracker";
import { contactSchema, type ContactInput } from "../../schema";
import styles from "./ContactForm.module.css";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  // const honeypotRef = useRef<HTMLInputElement>(null);
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          sourcePage: window.location.pathname,
          company: honeypot, // antes: honeypotRef.current?.value ?? ""
        }),
      });
      if (!res.ok) throw new Error("request failed");

      setStatus("success");
      reset();
      // Conversión (escalón 4) → reutiliza la sesión del tracker del S6-T1
      track("CONVERSION", { element: "contact-form", label: window.location.pathname });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>¡Gracias! 🎉</p>
        <p>Recibí tu mensaje y te respondo muy pronto.</p>
        <button type="button" className={styles.again} onClick={() => setStatus("idle")}>
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor="cf-name" className={styles.label}>
          Nombre
        </label>
        <input id="cf-name" className={styles.input} autoComplete="name" {...register("name")} />
        {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="cf-email" className={styles.label}>
          Email
        </label>
        <input
          id="cf-email"
          type="email"
          className={styles.input}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? <span className={styles.error}>{errors.email.message}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="cf-message" className={styles.label}>
          Mensaje
        </label>
        <textarea id="cf-message" className={styles.textarea} rows={5} {...register("message")} />
        {errors.message ? <span className={styles.error}>{errors.message.message}</span> : null}
      </div>

      {/* Honeypot: oculto a humanos, tentador para bots. No usar display:none de RHF. */}
      {/* Honeypot: oculto a humanos, tentador para bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {status === "error" ? (
        <p className={styles.formError} role="alert">
          Algo falló al enviar. Inténtalo de nuevo en un momento.
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
