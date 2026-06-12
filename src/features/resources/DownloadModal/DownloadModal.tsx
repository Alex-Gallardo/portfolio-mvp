"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDownloadModalStore } from "@/stores/useDownloadModalStore";
import { requestDownload } from "@/features/resources/requestDownload";
import styles from "./DownloadModal.module.css";

const schema = z.object({
  email: z.email("Ese email no parece válido"),
  name: z.string().optional(),
  consent: z.boolean().optional(),
  website: z.string().optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

type Status = "idle" | "loading" | "success" | "error";

function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function DownloadModal() {
  const { isOpen, target, close } = useDownloadModalStore();
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const sheetRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = useCallback(() => {
    reset();
    setStatus("idle");
    setServerError(null);
    setFileName("");
    close();
  }, [reset, close]);

  // Accesibilidad: scroll-lock + Esc + foco atrapado
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const sheet = sheetRef.current;
    const focusables = () =>
      Array.from(
        sheet?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "Tab") {
        const list = focusables();
        const first = list[0];
        const last = list[list.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !target) return null;

  const onSubmit = handleSubmit(async (values) => {
    setStatus("loading");
    setServerError(null);
    try {
      const res = await requestDownload({
        resourceSlug: target.resourceSlug,
        fileId: target.fileId,
        email: values.email,
        name: values.name,
        consent: values.consent,
        website: values.website,
      });
      setFileName(res.fileName);
      triggerDownload(res.signedUrl);
      setStatus("success");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Algo salió mal");
      setStatus("error");
    }
  });

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">
          ✕
        </button>

        {status === "success" ? (
          <div className={styles.success}>
            <h2 id="download-modal-title" className={styles.title}>
              ¡Listo! Tu descarga empieza ahora 🎉
            </h2>
            <p>{fileName ? `Archivo: ${fileName}` : "Revisa tu navegador."}</p>
            <button type="button" className={styles.submit} onClick={handleClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <h2 id="download-modal-title" className={styles.title}>
              ¿A dónde te lo envío?
            </h2>
            <p className={styles.sub}>Déjame tu correo y la descarga empieza al instante.</p>

            <label className={styles.label}>
              Email
              <input
                type="email"
                className={styles.input}
                autoComplete="email"
                {...register("email")}
              />
            </label>
            {errors.email ? <p className={styles.error}>{errors.email.message}</p> : null}

            <label className={styles.label}>
              Nombre (opcional)
              <input
                type="text"
                className={styles.input}
                autoComplete="name"
                {...register("name")}
              />
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" {...register("consent")} />
              Acepto recibir correos. Sin spam, puedes darte de baja cuando quieras.
            </label>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className={styles.honeypot}
              {...register("website")}
            />

            {serverError ? <p className={styles.error}>{serverError}</p> : null}

            <button type="submit" className={styles.submit} disabled={status === "loading"}>
              {status === "loading" ? "Preparando…" : "Descargar ahora"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
