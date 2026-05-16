import AboutSection from "@/components/home/AboutSection"
import ContactSection from "@/components/home/ContactSection"
import HeroSection from "@/components/home/HeroSection"
import RoomsSection from "@/components/home/RoomsSection"

const Home = () => {
    return (
        <main>
            <section id="hero">
                <HeroSection />
            </section>
            <section id="rooms">
                <RoomsSection />
            </section>
            <section id="about">
                <AboutSection />
            </section>
            <section id="contact">
                <ContactSection />
            </section>
        </main>
    )
}
export default Home