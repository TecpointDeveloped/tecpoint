import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/footer2026.module.css";

const orderPoints = [
  {
    city: "San Pedro Sula",
    name: "Plaza Carolina",
    detail: "Segundo nivel, bulevar Mackay",
    phone: "50493385732",
  },
  {
    city: "Tegucigalpa",
    name: "Portal de Viera",
    detail: "Tercer nivel, km 3 carretera a El Hatillo",
    phone: "50495200523",
  },
  {
    city: "San Pedro Sula",
    name: "Mayoreo y Pick Up",
    detail: "Barrio Los Andes, 7 calle, 14 avenida",
    phone: "50498191003",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <section className={styles.top}>
        <div>
          <Image
            src="/brand/logo-reserva.svg"
            alt="TECPOINT"
            width={205}
            height={46}
            style={{ width: "205px", height: "auto" }}
          />
          <p>Tecnología seleccionada y atención cercana en Honduras.</p>
        </div>
        <a
          className={styles.mainOrder}
          href="https://wa.me/50497157784?text=Hola%20TECPOINT%2C%20quiero%20hacer%20un%20pedido."
          target="_blank"
          rel="noreferrer"
        >
          Hacer un pedido
        </a>
      </section>

      <section className={styles.locations}>
        {orderPoints.map((point) => (
          <article key={point.name}>
            <small>{point.city}</small>
            <strong>{point.name}</strong>
            <p>{point.detail}</p>
            <a
              href={`https://wa.me/${point.phone}?text=Hola%20TECPOINT%2C%20quiero%20hacer%20un%20pedido%20con%20${encodeURIComponent(point.name)}.`}
              target="_blank"
              rel="noreferrer"
            >
              Pedir aquí →
            </a>
          </article>
        ))}
      </section>

      <section className={styles.bottom}>
        <nav>
          <Link href="/shop">Tienda</Link>
          <Link href="/categories">Categorías</Link>
          <Link href="/garantia">Garantía</Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link href="/terminos-y-condiciones">Términos</Link>
          <Link href="/politica-privacidad">Privacidad</Link>
        </nav>
        <div className={styles.social}>
          <a href="https://www.instagram.com/tecpoint_distribucion/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/Tecpoint.Distribucion/" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.tiktok.com/@tecpoint.ws" target="_blank" rel="noreferrer">TikTok</a>
        </div>
        <p>© {new Date().getFullYear()} TECPOINT. Todos los derechos reservados.</p>
      </section>
    </footer>
  );
}
