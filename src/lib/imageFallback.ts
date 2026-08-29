import type { SyntheticEvent } from "react";

export function productImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.removeAttribute("srcset");
  image.src = "/brand/isologo.svg";
  image.style.padding = "18%";
  image.style.objectFit = "contain";
  image.style.background = "#f4f6f7";
}
