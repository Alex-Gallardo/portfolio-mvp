import Link from "next/link";
import { MessageStatus } from "@prisma/client";
import { getMessages, getMessageCounts } from "@/features/contact/queries";
import { setMessageStatus } from "@/features/contact/actions";
import styles from "./mensajes.module.css";

export const dynamic = "force-dynamic";

const STATUSES: { key: MessageStatus; label: string }[] = [
  { key: "NEW", label: "Nuevos" },
  { key: "READ", label: "Leídos" },
  { key: "REPLIED", label: "Respondidos" },
  { key: "SPAM", label: "Spam" },
];

const STATUS_LABEL: Record<MessageStatus, string> = {
  NEW: "Nuevo",
  READ: "Leído",
  REPLIED: "Respondido",
  SPAM: "Spam",
};

function isStatus(v: string | undefined): v is MessageStatus {
  return !!v && (Object.values(MessageStatus) as string[]).includes(v);
}

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = isStatus(status) ? status : undefined;

  const [messages, { counts, total }] = await Promise.all([
    getMessages(active),
    getMessageCounts(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Mensajes</h1>
      </header>

      {/* Filtro por estado */}
      <nav className={styles.filter} aria-label="Filtrar por estado">
        <Link
          href="/admin/mensajes"
          className={`${styles.pill} ${!active ? styles.active : ""}`}
          aria-current={!active ? "page" : undefined}
        >
          Todos <span className={styles.count}>{total}</span>
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={`/admin/mensajes?status=${s.key}`}
            className={`${styles.pill} ${active === s.key ? styles.active : ""}`}
            aria-current={active === s.key ? "page" : undefined}
          >
            {s.label} <span className={styles.count}>{counts[s.key] ?? 0}</span>
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <p className={styles.empty}>No hay mensajes con este filtro.</p>
      ) : (
        <ul className={styles.list}>
          {messages.map((m) => (
            <li key={m.id} className={`${styles.card} ${m.status === "NEW" ? styles.unread : ""}`}>
              <div className={styles.cardHead}>
                <div>
                  <span className={styles.name}>{m.name}</span>
                  <a href={`mailto:${m.email}`} className={styles.email}>
                    {m.email}
                  </a>
                </div>
                <div className={styles.metaRight}>
                  <span className={`${styles.badge} ${styles[`s_${m.status}`]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                  <span className={styles.date}>
                    {m.createdAt.toLocaleDateString("es", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className={styles.message}>{m.message}</p>

              {m.sourcePage ? <span className={styles.source}>Desde: {m.sourcePage}</span> : null}

              <div className={styles.actions}>
                <a href={`mailto:${m.email}?subject=Re:%20tu%20mensaje`} className={styles.reply}>
                  Responder
                </a>
                {(["READ", "REPLIED", "SPAM"] as MessageStatus[]).map((next) =>
                  m.status === next ? null : (
                    <form key={next} action={setMessageStatus} className={styles.actionForm}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value={next} />
                      <button type="submit" className={styles.actionBtn}>
                        Marcar {STATUS_LABEL[next].toLowerCase()}
                      </button>
                    </form>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
