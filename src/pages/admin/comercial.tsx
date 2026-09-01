import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/database/Config";
import { useAuth } from "@/context/useAuth";
import { isAdminEmail } from "@/lib/adminAccess";
import {
  SalesConversation,
  SalesOrder,
} from "@/types/SalesTypes";
import styles from "@/styles/commercialAdmin.module.css";

function timeValue(value?: { toDate?: () => Date }) {
  return value?.toDate?.().getTime() || 0;
}

export default function CommercialAdmin() {
  const { currentUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<SalesConversation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    setAuthorized(isAdminEmail(currentUser?.email));
  }, [currentUser]);

  useEffect(() => {
    if (!authorized) return;

    const unsubscribeConversations = onSnapshot(
      collection(db, "sales_conversations"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as SalesConversation[];
        setConversations(
          data.sort((a, b) => timeValue(b.updatedAt) - timeValue(a.updatedAt)),
        );
      },
    );

    const unsubscribeOrders = onSnapshot(
      collection(db, "sales_orders"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as SalesOrder[];
        setOrders(
          data.sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt)),
        );
      },
    );

    return () => {
      unsubscribeConversations();
      unsubscribeOrders();
    };
  }, [authorized]);

  const filtered = useMemo(
    () =>
      status === "all"
        ? conversations
        : conversations.filter((item) => item.status === status),
    [conversations, status],
  );

  async function claimConversation(conversation: SalesConversation) {
    if (!currentUser) return;
    await updateDoc(doc(db, "sales_conversations", conversation.id), {
      assignedTo: currentUser.uid,
      assignedName: currentUser.displayName || currentUser.email,
      status: "assigned",
      updatedAt: serverTimestamp(),
    });
  }

  if (loading || authorized === null) {
    return <main className={styles.state}>Verificando acceso comercial…</main>;
  }

  if (!currentUser || !authorized) {
    return (
      <main className={styles.state}>
        <Image src="/brand/isologo.svg" alt="" width={90} height={90} />
        <h1>Acceso reservado</h1>
        <p>
          Esta sección requiere una cuenta TECPOINT con rol de administrador o
          asesor.
        </p>
        <Link href="/my-account">Iniciar sesión</Link>
      </main>
    );
  }

  const openOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  );

  return (
    <>
      <Head>
        <title>Centro comercial | TECPOINT</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className={styles.dashboard}>
        <header>
          <div>
            <Image
              src="/brand/logo-principal.svg"
              alt="TECPOINT"
              width={180}
              height={34}
            />
            <span>Centro comercial</span>
          </div>
          <div>
            <small>ASESOR ACTIVO</small>
            <strong>{currentUser.displayName || currentUser.email}</strong>
            <Link href="/admin/codigos">Códigos y referidos →</Link>
          </div>
        </header>

        <section className={styles.intro}>
          <div>
            <p>MENSAJES Y COMPRAS</p>
            <h1>Un punto para cada conversación.</h1>
          </div>
          <div className={styles.metrics}>
            <article>
              <span>Nuevos</span>
              <strong>
                {conversations.filter((item) => item.status === "new").length}
              </strong>
            </article>
            <article>
              <span>Asignados</span>
              <strong>
                {conversations.filter((item) => item.status === "assigned").length}
              </strong>
            </article>
            <article>
              <span>Pedidos abiertos</span>
              <strong>{openOrders.length}</strong>
            </article>
          </div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.inbox}>
            <div className={styles.sectionTitle}>
              <div>
                <small>BANDEJA UNIFICADA</small>
                <h2>Conversaciones</h2>
              </div>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="new">Nuevos</option>
                <option value="assigned">Asignados</option>
                <option value="waiting">En espera</option>
                <option value="closed">Cerrados</option>
              </select>
            </div>

            <div className={styles.list}>
              {filtered.length === 0 ? (
                <p className={styles.empty}>
                  Las conversaciones aparecerán aquí cuando se conecten los
                  canales oficiales.
                </p>
              ) : (
                filtered.map((conversation) => (
                  <article key={conversation.id}>
                    <div className={styles.channel}>
                      {conversation.channel.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{conversation.customerName}</strong>
                      <small>{conversation.channel}</small>
                      <p>{conversation.lastMessage}</p>
                      {conversation.assignedName && (
                        <span>Asignado a {conversation.assignedName}</span>
                      )}
                    </div>
                    {!conversation.assignedTo && (
                      <button onClick={() => claimConversation(conversation)}>
                        Atender
                      </button>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className={styles.orders}>
            <div className={styles.sectionTitle}>
              <div>
                <small>SEGUIMIENTO</small>
                <h2>Pedidos</h2>
              </div>
            </div>
            {openOrders.length === 0 ? (
              <p className={styles.empty}>No hay pedidos abiertos.</p>
            ) : (
              openOrders.slice(0, 10).map((order) => (
                <article key={order.id}>
                  <div>
                    <strong>{order.customerName}</strong>
                    <span>{order.id}</span>
                  </div>
                  <b>L {Number(order.total || 0).toLocaleString("es-HN")}</b>
                  <small>{order.status}</small>
                </article>
              ))
            )}
          </aside>
        </section>
      </main>
    </>
  );
}
