import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers } from 'react-icons/fi';
import { GiMolecule, GiMicroscope, GiDna1 } from 'react-icons/gi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import './Hero.css';

const stats = [
  {
    icon: <HiOutlineDocumentText size={22} />,
    value: '50+',
    label: 'Published Research Papers',
  },
  {
    icon: <FiUsers size={22} />,
    value: '10+',
    label: 'Years of Collective Expertise',
  },
  {
    icon: <GiMolecule size={22} />,
    value: '3',
    label: 'Core Research Domains',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* Molecular background pattern */}
      <div className="hero__bg-pattern" aria-hidden="true">
        <div className="hero__molecule hero__molecule--1" />
        <div className="hero__molecule hero__molecule--2" />
        <div className="hero__molecule hero__molecule--3" />
        <div className="hero__helix-line hero__helix-line--1" />
        <div className="hero__helix-line hero__helix-line--2" />
      </div>

      <div className="hero__content container">
        <div className="hero__left">
          <motion.div
            className="hero__badge"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <GiDna1 size={14} />
            Research-Driven Scientific Organization
          </motion.div>

          <motion.h1
            className="hero__headline"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Advancing Science,
            <br />
            <span className="hero__headline-accent">Shaping the Future</span>
          </motion.h1>

          <motion.p
            className="hero__subheadline"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Padma Bioresearch Organization (PBR) conducts cutting-edge research
            using <em>in silico</em>, <em>in vitro</em>, and <em>in vivo</em>{' '}
            approaches under the guidance of expert researchers and supervisors.
          </motion.p>

          <motion.div
            className="hero__cta-group"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <a href="#research" className="btn btn-primary">
              Explore Our Research <FiArrowRight size={18} />
            </a>
            <a href="#contact" className="btn btn-secondary">
              Join Our Team
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__right"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="hero__visual">
            {/* Decorative floating elements */}
            <div className="hero__visual-orb hero__visual-orb--1" />
            <div className="hero__visual-orb hero__visual-orb--2" />
            <div className="hero__visual-orb hero__visual-orb--3" />

            <div className="hero__visual-card">
              <GiMicroscope className="hero__visual-icon" />
              <div className="hero__visual-card-content">
                <span className="hero__visual-card-label">Active Research</span>
                <strong>In Silico &middot; In Vitro &middot; In Vivo</strong>
              </div>
            </div>

            <div className="hero__visual-dna">
              <svg viewBox="0 0 200 300" className="hero__dna-svg">
                <path
                  d="M60 10 Q100 75 60 150 Q20 225 60 290"
                  fill="none"
                  stroke="rgba(78,205,196,0.4)"
                  strokeWidth="2"
                />
                <path
                  d="M140 10 Q100 75 140 150 Q180 225 140 290"
                  fill="none"
                  stroke="rgba(78,205,196,0.25)"
                  strokeWidth="2"
                />
                {[30, 70, 110, 150, 190, 230, 270].map((y, i) => (
                  <line
                    key={i}
                    x1={60 + Math.sin(y * 0.02) * 40}
                    y1={y}
                    x2={140 - Math.sin(y * 0.02) * 40}
                    y2={y}
                    stroke="rgba(78,205,196,0.15)"
                    strokeWidth="1"
                  />
                ))}
                {[30, 70, 110, 150, 190, 230, 270].map((y, i) => (
                  <g key={`dots-${i}`}>
                    <circle
                      cx={60 + Math.sin(y * 0.02) * 40}
                      cy={y}
                      r="4"
                      fill="var(--color-teal)"
                      opacity="0.6"
                    />
                    <circle
                      cx={140 - Math.sin(y * 0.02) * 40}
                      cy={y}
                      r="4"
                      fill="var(--color-teal)"
                      opacity="0.4"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="hero__stats"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <div className="hero__stats-inner container">
          {stats.map((stat, i) => (
            <div className="hero__stat" key={i}>
              <div className="hero__stat-icon">{stat.icon}</div>
              <div>
                <div className="hero__stat-value">{stat.value}</div>
                <div className="hero__stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
