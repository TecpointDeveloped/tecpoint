import Image from "next/image";
import Link from "next/link";

type Category = {
  imagen: string;
  alt: string;
}

function CategoryCards({ imagen, alt }: Category) {
  return (
    <div className="overflow-hidden relative min-w-[500px] h-[244px] rounded-[26px]">
      <div className="bg-[#0000005b] backdrop-blur-sm absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"></div>

      <Image
        alt={alt || "imagen de categoria no encontrada"}
        width={500}
        height={244}
        quality={95}
        src={imagen || ""}
        className="object-cover w-full h-full"
      />

      <div className="absolute bottom-0 left-0 p-8">
        <Link
          href="/shop"
          className="bg-white w-fit flex items-center justify-center gap-x-1 py-2 px-5 rounded-full relative hover:bg-black hover:text-white"
          onMouseEnter={(e) => {
            const parent = e.currentTarget.parentElement?.parentElement;
            if (parent) {
              const blurDiv = parent.querySelector('div');
              if (blurDiv) blurDiv.classList.add('opacity-100');
            }
          }}
          onMouseLeave={(e) => {
            const parent = e.currentTarget.parentElement?.parentElement;
            if (parent) {
              const blurDiv = parent.querySelector('div');
              if (blurDiv) blurDiv.classList.remove('opacity-100');
            }
          }}
        >
          ver mas

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default CategoryCards