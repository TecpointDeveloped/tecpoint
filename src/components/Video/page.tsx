'use client';

import { useEffect } from 'react';

interface VideoProps {
  videoId: string;
}

const TikTokEmbed = ({ videoId }: VideoProps) => {
  useEffect(() => {
    // Verifica si el script ya existe
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Fuerza a TikTok a re-renderizar los embeds existentes
      (window as any).tiktokEmbed && (window as any).tiktokEmbed.load();
    }
  }, [videoId]); // Ejecuta el efecto si `videoId` cambia

  return (
    <blockquote
      className="tiktok-embed"
      cite={`https://www.tiktok.com/@scout2015/video/${videoId}`}
      data-video-id={videoId}
      style={{ maxWidth: '605px', minWidth: '325px' }}
    ></blockquote>
  );
};

export default TikTokEmbed;
