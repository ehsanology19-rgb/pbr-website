import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import ResearchAreas from './ResearchAreas';
import Publications from './Publications';
import Team from './Team';
import Projects from './Projects';
import Collaborations from './Collaborations';
import CTA from './CTA';
import Contact from './Contact';
import Footer from './Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ResearchAreas />
        <Publications />
        <Team />
        <Projects />
        <Collaborations />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
