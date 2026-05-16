import Image from "next/image"
import { Prompt, Noto_Sans_Thai } from "next/font/google"
import Link from "next/link"

const prompt = Prompt({
  subsets: ["thai"],
  weight: ["300", "400", "600", "700"],
})

const NotoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400"],
})

const HeroSection = () => {

 

  return (
    <main>
      <div className="relative w-full h-[600px] overflow-hidden">

        <Image
          src="/lotus-design-n-print-0sDzRgrN_pI-unsplash.jpg"
          alt="hero"
          fill
          priority
          className="object-cover animate-[zoomSlow_20s_ease-in-out_infinite]"
        />

        <div className="absolute inset-0 bg-[#181b22a7] z-0" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1
            className={`${prompt.className} text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl`}
          >
            สัมผัสประสบการณ์การพักผ่อนเหนือระดับ
            <br className="m-4" />
            ในบรรยากาศที่ออกแบบมาเพื่อคุณโดยเฉพาะ
          </h1>

          <p
            className={`${NotoSansThai.className} mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-200`}
          >
            ง่ายดายและรวดเร็วทันใจ
          </p>

          <div className="mt-20 flex gap-4 items-center">
            <Link
              href="/#rooms"
              className="bg-[#c9a96e] py-[10px] px-4 rounded-sm hover:bg-[#ccb282] transition duration-300"
            >
              ROOMS
            </Link>

            <Link
              href="/#about"
              className="text-white border border-[#e3e3e3] py-[10px] px-3 rounded-sm
              hover:border-amber-200 hover:text-amber-300 transition duration-300"
            >
              OUR STORY
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HeroSection