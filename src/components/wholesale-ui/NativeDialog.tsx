import { useEffect, useRef, type ReactNode } from 'react';
import styles from '@/styles/wholesale-ui/commerce.module.css';
export function NativeDialog({ children, onClose, label, drawer = false }: { children: ReactNode; onClose: () => void; label: string; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} className={drawer ? styles.drawerDialog : styles.dialog} aria-labelledby={label} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className={styles.dialogInner}>{children}</div></dialog>;
}
