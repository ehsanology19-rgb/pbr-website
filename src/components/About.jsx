import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiTarget, FiEye, FiAward } from 'react-icons/fi';
import './About.css';

const pillars = [
  {
    icon: <FiTarget size={24} />,
    title: 'Our Mission',
    text: 'To foster innovative biomedical research that bridges computational modeling with experimental validation, driving discoveries that improve human health.',
  },
  {
    icon: <FiEye size={24} />,
    title: 'Our Vision',
    text: 'To become a globally recognized center of excellence in integrated bioresearch — combining in silico, in vitro, and in vivo methodologies to solve complex scientific challenges.',
  },
  {
    icon: <FiAward size={24} />,
    title: 'Our Values',
    text: 'Scientific rigor, ethical integrity, collaborative innovation, and a commitment to mentoring the next generation of researchers and scientists.',
  },
];

export default function About() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section className="about" id="about" ref={ref}>
      <div className="container">
        <div className="about__grid">
          <motion.div
            className="about__left"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">About PBR</span>
            <h2 className="section-title">
              Dedicated to Scientific Excellence Since Day One
            </h2>
            <p className="about__description">
              Padma Bioresearch Organization (PBR) is a research-driven scientific
              body committed to advancing knowledge in life sciences and
              biotechnology. Founded on the principles of academic rigor and
              interdisciplinary collaboration, PBR operates at the intersection of
              computational biology, laboratory experimentation, and translational
              research.
            </p>
            <p className="about__description">
              Under the mentorship of seasoned researchers and supervisors, our team
              works on projects that span drug discovery, molecular modeling,
              biomarker identification, and preclinical studies — contributing
              meaningfully to the global scientific community.
            </p>
            <div className="about__highlights">
              <div className="about__highlight">
                <strong>Multidisciplinary</strong>
                <span>Research Approach</span>
              </div>
              <div className="about__highlight">
                <strong>Expert-Led</strong>
                <span>Supervision & Mentorship</span>
              </div>
              <div className="about__highlight">
                <strong>Publication</strong>
                <span>Focused Outcomes</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="about__right"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {pillars.map((pillar, i) => (
              <motion.div
                className="about__pillar"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              >
                <div className="about__pillar-icon">{pillar.icon}</div>
                <div>
                  <h3 className="about__pillar-title">{pillar.title}</h3>
                  <p className="about__pillar-text">{pillar.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
