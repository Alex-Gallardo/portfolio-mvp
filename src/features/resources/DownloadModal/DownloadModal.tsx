"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDownloadModalStore } from "@/stores/useDownloadModalStore";
import { requestDownload } from "@/features/resources/requestDownload";
import { PixelSprite, UI_SPRITES } from "@/features/resources/detail/sprites";
import { pixelFont } from "@/features/resources/pixelFont";
import { VoxelChest, type ChestState } from "./VoxelChest";
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

/**
 * Diálogo de descarga: el mostrador de la tienda. Cofre voxel que se abre
 * cuando el botín está listo, formulario en casillas pixel, barra de
 * progreso por pasos y estado de éxito con el archivo y un "+1".
 */
export function DownloadModal() {
  const { isOpen, target, close } = useDownloadModalStore();
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
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
    setSignedUrl(null);
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
      setSignedUrl(res.signedUrl);
      triggerDownload(res.signedUrl);
      setStatus("success");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Algo salió mal");
      setStatus("error");
    }
  });

  const chest: ChestState = status;
  const emailError = errors.email?.message;

  return (
    <div className={`${styles.overlay} ${pixelFont.variable}`} onClick={handleClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
        aria-describedby="download-modal-desc"
        data-status={status}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.chassis} aria-hidden="true" />

        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar">
          <svg
            viewBox="0 0 7 7"
            width="14"
            height="14"
            fill="currentColor"
            shapeRendering="crispEdges"
          >
            <path d="M0 0h2v1h-2zM5 0h2v1h-2zM1 1h2v1h-2zM4 1h2v1h-2zM2 2h3v1h-3zM2 3h3v1h-3zM1 4h2v1h-2zM4 4h2v1h-2zM0 5h2v1h-2zM5 5h2v1h-2z" />
          </svg>
        </button>

        <div className={styles.counter}>
          <VoxelChest state={chest} />
          {target.resourceTitle ? (
            <p className={styles.item}>
              <span className={styles.itemLabel}>Botín</span>
              <span className={styles.itemName}>{target.resourceTitle}</span>
            </p>
          ) : null}
        </div>

        {status === "success" ? (
          <div className={styles.success} role="status" aria-live="polite">
            <h2 id="download-modal-title" className={styles.title}>
              ¡Botín conseguido!
            </h2>
            <p id="download-modal-desc" className={styles.sub}>
              Tu descarga ya empezó. Si el navegador la bloqueó, vuelve a pedirla aquí abajo.
            </p>
            {fileName ? (
              <p className={styles.fileChip}>
                <PixelSprite sprite={UI_SPRITES.download} scale={1.5} />
                <span>{fileName}</span>
                <span className={styles.plusOne} aria-hidden="true">
                  +1
                </span>
              </p>
            ) : null}
            <div className={styles.actions}>
              <button type="button" className={styles.submit} onClick={handleClose}>
                Seguir explorando
              </button>
              {signedUrl ? (
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => triggerDownload(signedUrl)}
                >
                  Descargar de nuevo
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <h2 id="download-modal-title" className={styles.title}>
              ¿A dónde te lo envío?
            </h2>
            <p id="download-modal-desc" className={styles.sub}>
              Déjame tu correo y el cofre se abre al instante.
            </p>

            <label className={styles.field} data-invalid={emailError ? "" : undefined}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.control}>
                <PixelSprite sprite={UI_SPRITES.mail} className={styles.controlIcon} />
                <input
                  type="email"
                  className={styles.input}
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "download-email-error" : undefined}
                  {...register("email")}
                />
              </span>
              {emailError ? (
                <span id="download-email-error" className={styles.error}>
                  {emailError}
                </span>
              ) : null}
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                Nombre <span className={styles.optional}>(opcional)</span>
              </span>
              <span className={styles.control}>
                <PixelSprite sprite={UI_SPRITES.user} className={styles.controlIcon} />
                <input
                  type="text"
                  className={styles.input}
                  autoComplete="name"
                  placeholder="¿Cómo te llamas?"
                  {...register("name")}
                />
              </span>
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" className={styles.checkbox} {...register("consent")} />
              <span className={styles.checkBox} aria-hidden="true">
                <PixelSprite sprite={UI_SPRITES.check} scale={1.5} />
              </span>
              <span>Acepto recibir correos. Sin spam, puedes darte de baja cuando quieras.</span>
            </label>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className={styles.honeypot}
              {...register("website")}
            />

            {serverError ? (
              <p className={styles.serverError} role="alert">
                {serverError}
              </p>
            ) : null}

            <button type="submit" className={styles.submit} disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <span className={styles.progress} aria-hidden="true">
                    <span />
                  </span>
                  Abriendo el cofre…
                </>
              ) : (
                <>
                  <PixelSprite sprite={UI_SPRITES.download} />
                  Descargar ahora
                </>
              )}
            </button>

            <p className={styles.trust}>
              <PixelSprite sprite={UI_SPRITES.shield} className={styles.trustIcon} />
              <span>Gratis · Sin spam · 30 seg</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
