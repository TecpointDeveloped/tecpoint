'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

export default function CameraVideoUPC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);

    const codeReader = new BrowserMultiFormatReader(hints);
    const videoElement = videoRef.current;

    if (!videoElement) return;

    codeReader.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
      if (result) {
        const text = result.getText();
        setResult(text);
        console.log('✅ Código UPC detectado:', text);
        // Detener escaneo (opcional)
        // (codeReader as any).reset();
      }

      if (err && err.name !== 'NotFoundException') {
        console.error('🚫 Error de lectura:', err);
      }
    });

    return () => {
      console.log('🛑 Deteniendo flujo de video');
      // (codeReader as any).reset();
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: '300px', height: '230px', border: '2px dashed #888', borderRadius: '10px' }}
      />
      {result && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          📦 Código detectado: {result}
        </p>
      )}

      <p>codigo escaneado: {result}</p>
    </div>
  );
}
