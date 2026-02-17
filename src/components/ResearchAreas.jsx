import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { GiMicroscope, GiLabCoat } from 'react-icons/gi';
import { FiArrowRight } from 'react-icons/fi';
import './ResearchAreas.css';

const areas = [
  {
    icon: <HiOutlineDesktopComputer size={32} />,
    tag: 'Computational',
    title: 'In Silico Research',
    description:
      'Leveraging computational models, molecular simulations, bioinformatics tools, and machine learning to predict biological interactions, screen drug candidates, and analyze complex datasets — accelerating the research pipeline before entering the lab.',
    highlights: [
      'Molecular Docking & Dynamics',
      'QSAR & Pharmacophore Modeling',
      'Genomics & Proteomics Analysis',
      'AI-Driven Drug Discovery',
    ],
    gradient: 'linear-gradient(135deg, #0A2540, #164B60)',
  },
  {
    icon: <GiMicroscope size={32} />,
    tag: 'Laboratory',
    title: 'In Vitro Research',
    description:
      'Conducting controlled experiments in cell cultures, tissue samples, and biochemical assays to validate computational predictions and explore biological mechanisms at the cellular and molecular level with precision and reproducibility.',
    highlights: [
      'Cell Culture & Cytotoxicity Assays',
      'Enzyme Kinetics & Inhibition Studies',
      'Antimicrobial & Antioxidant Screening',
      'Biomarker Identification',
    ],
    gradient: 'linear-gradient(135deg, #0D5C63, #0A8754)',
  },
  {
    icon: <GiLabCoat size={32} />,
    tag: 'Preclinical',
    title: 'In Vivo Research',
    description:
      'Performing preclinical animal model studies under strict ethical guidelines to evaluate drug efficacy, toxicology profiles, and pharmacokinetics — bridging the gap between laboratory findings and potential clinical applications.',
    highlights: [
      'Pharmacokinetic & Toxicology Studies',
      'Disease Model Development',
      'Efficacy & Safety Evaluation',
      'Translational Research Pathways',
    ],
    gradient: 'linear-gradient(135deg, #1A1A2E, #16213E)',
  },
];

export default function ResearchAreas() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="research" id="research" ref={ref}>
      <div className="container">
        <motion.div
          className="research__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Research Areas</span>
          <h2 className="section-title">
            Three Pillars of Scientific Discovery
          </h2>
          <p className="section-subtitle">
            Our integrated research approach combines computational prediction,
            laboratory validation, and preclinical evaluation — ensuring rigor
            and reproducibility at every stage.
          </p>
        </motion.div>

        <div className="research__cards">
          {areas.map((area, i) => (
            <motion.div
              className="research__card"
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
            >
              <div
                className="research__card-top"
                style={{ background: area.gradient }}
              >
                <div className="research__card-tag">{area.tag}</div>
                <div className="research__card-icon">{area.icon}</div>
                <h3 className="research__card-title">{area.title}</h3>
              </div>
              <div className="research__card-body">
                <p className="research__card-desc">{area.description}</p>
                <ul className="research__card-list">
                  {area.highlights.map((h, j) => (
                    <li key={j}>
                      <span className="research__card-bullet" />
                      {h}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="research__card-link">
                  Learn More <FiArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
