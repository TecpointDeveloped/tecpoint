/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from 'react';

type CatalogImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
 src: string;
 fill?: boolean;
 priority?: boolean;
 quality?: number;
 unoptimized?: boolean;
};

export default function Image({fill,priority,quality,unoptimized,decoding='async',loading,style,src,...props}:CatalogImageProps){
 void quality;
 void unoptimized;
 const srcSet=typeof src==='string'&&src.includes('/thumbs/')&&src.endsWith('-320.webp')?`${src} 320w, ${src.replace('-320.webp','-640.webp')} 640w`:undefined;
 return <img {...props} alt={props.alt ?? ''} src={src} srcSet={srcSet} decoding={decoding} loading={priority?'eager':loading||'lazy'} fetchPriority={priority?'high':'auto'} style={{...(fill?{position:'absolute',inset:0,width:'100%',height:'100%'}:{}),...style}}/>;
}
