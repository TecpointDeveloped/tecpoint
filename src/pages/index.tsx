import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import LogosImages from "@/data/logos.json";

type Logo = {
  key: string;
  logo: string;
};

export async function getStaticProps() {
  return {
    props: {
      logos: LogosImages as Logo[],
    },
    revalidate: 3600,
  };
}

interface HomeProps {
  logos: Logo[];
}

export default function Home({ logos = [] }: HomeProps) {
  return (
    <div>
      <NavbarMenu />

      <div className="relative overflow-hidden w-full md:w-full lg:max-w-[1900px] py-4 m-auto">
        <div className="bg-gradient-to-r from-white to-transparent h-full w-24 absolute top-0 left-0 z-10" />
        <div className="marquee">
          <div className="marquee-inner flex">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="bg-[#fafafa] hover:bg-[#f3f3f3] w-[260px] h-[70px] 2xl:h-[80px] rounded-[8px] grid place-content-center grayscale hover:grayscale-0 cursor-pointer transition-all mx-4"
              >
                <Image
                  height={30}
                  width={180}
                  quality={87}
                  src={logo.logo || ""}
                  alt={`Logo ${index}`}
                  className="w-fit h-[30px] select-none"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-transparent to-white h-full w-24 absolute top-0 right-0 z-10" />
      </div>
    </div>
  );
}