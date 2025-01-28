// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import styles from "./InfiniteCarousel.module.css";

// type InfiniteCarouselProps = {
//   slides: string[]; // URLs de imágenes
// };

// const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({ slides }) => {
//   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   const onSelect = useCallback(() => {
//     if (!emblaApi) return;
//     setSelectedIndex(emblaApi.selectedScrollSnap());
//   }, [emblaApi]);

//   useEffect(() => {
//     if (!emblaApi) return;
//     emblaApi.on("select", onSelect);
//   }, [emblaApi, onSelect]);

//   return (
//     <div className={styles.embla} ref={emblaRef}>
//       <div className={styles.embla__container}>
//         {slides.map((src, index) => (
//           <div className={styles.embla__slide} key={index}>
//             <img
//               src={src}
//               alt={`Slide ${index}`}
//               className={styles.embla__slide__img}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default InfiniteCarousel;


import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

export function EmblaCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    if (emblaApi) {
      console.log(emblaApi.slideNodes()) // Access API
    }
  }, [emblaApi])

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        <div className="embla__slide">Slide 1</div>
        <div className="embla__slide">Slide 2</div>
        <div className="embla__slide">Slide 3</div>
      </div>
    </div>
  )
}
