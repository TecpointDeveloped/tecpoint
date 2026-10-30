import { useMemo, useState, useEffect } from 'react';
import Catalog from './CatalogExperience';
import { NativeDialog } from './NativeDialog';
import { decodeCatalog, type PackedCatalog } from '@/lib/wholesale-ui/catalogData';
import styles from '@/styles/wholesale-ui/message.module.css';
export default function CatalogApp({catalog, popularSkus}:{catalog:PackedCatalog; popularSkus: string[]}) {
  const products = useMemo(() => decodeCatalog(catalog), [catalog]);
  const [message,setMessage] = useState(''),[copied,setCopied] = useState(false),[copyFailed,setCopyFailed] = useState(false);
  useEffect(() => { const receive = (event:Event) => {setMessage(String((event as CustomEvent).detail)); setCopied(false);setCopyFailed(false);}; window.addEventListener('preview-order-text',receive);return () => window.removeEventListener('preview-order-text',receive); }, []);
  const long = message.length > 3500;
  const draft = long ? 'Hola, deseo cotizar un pedido de mayoreo TECPOINT. Voy a pegar mi lista para confirmar precios y existencias.' : message;
  return <div id="tecpoint-wholesale"><Catalog allProducts={products} popularSkus={popularSkus}/>{message && <NativeDialog label="wholesale-message-title" onClose={()=>setMessage('')}><div className={styles.message}><h2 id="wholesale-message-title">Tu pedido, listo para revisar.</h2><p>El asesor confirmará precios y existencias. No se ha enviado ningún mensaje.</p><pre>{message}</pre><p role="status">{copyFailed ? 'Selecciona y copia el texto del mensaje.' : long ? 'Copia el mensaje completo y pégalo en WhatsApp después de abrir la conversación.' : 'WhatsApp se abrirá con un borrador. Tú decides cuándo enviarlo.'}</p><button onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);}catch{setCopyFailed(true);}}}>{copied?'Mensaje copiado':'Copiar mensaje completo'}</button><a href={'https://wa.me/50498191003?text='+encodeURIComponent(draft)} target="_blank" rel="noopener noreferrer">Continuar en WhatsApp ↗</a><button onClick={()=>setMessage('')}>Volver al catálogo</button></div></NativeDialog>}</div>;
}
