import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import './Projects.css';

const projects = [
  {
    status: 'Active',
    title: 'AI-Powered Virtual Screening for Anti-Cancer Lead Molecules',
    description:
      'Employing deep learning models and molecular docking simulations to identify potential anti-cancer drug candidates from large chemical libraries.',
    tags: ['In Silico', 'Machine Learning', 'Drug Discovery'],
    progress: 75,
  },
  {
    status: 'Active',
    title: 'Phytochemical Profiling & Bioactivity Assessment of Medicinal Plants',
    description:
      'Systematic extraction, characterization, and in vitro testing of bioactive compounds from traditional medicinal plants for antimicrobial and anti-inflammatory properties.',
    tags: ['In Vitro', 'Phytochemistry', 'Natural Products'],
    progress: 60,
  },
  {
    status: 'Active',
    title: 'Preclinical Evaluation of Nanoparticle Drug Delivery Systems',
    description:
      'Designing and testing targeted nanoparticle formulations for enhanced drug delivery, assessed through in vivo pharmacokinetic and biodistribution studies in murine models.',
    tags: ['In Vivo', 'Nanomedicine', 'Pharmacokinetics'],
    progress: 40,
  },
  {
    status: 'Upcoming',
    title: 'Multi-Omics Integration for Biomarker Discovery in Metabolic Disorders',
    description:
      'Integrating genomics, proteomics, and metabolomics data using computational pipelines to identify novel biomarkers for early diagnosis of metabolic diseases.',
    tags: ['In Silico', 'Omics', 'Biomarker Research'],
    progress: 15,
  },
];

export default function Projects() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="projects" id="projects" ref={ref}>
      <div className="container">
        <motion.div
          className="projects__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Ongoing Projects</span>
          <h2 className="section-title">Current Research Initiatives</h2>
          <p className="section-subtitle">
            Explore our active and upcoming research projects spanning
            computational biology, laboratory experimentation, and preclinical
            studies.
          </p>
        </motion.div>

        <div className="projects__grid">
          {projects.map((project, i) => (
            <motion.div
              className="projects__card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
            >
              <div className="projects__card-header">
                <span
                  className={`projects__status projects__status--${project.status.toLowerCase()}`}
                >
                  <FiClock size={12} />
                  {project.status}
                </span>
                <div className="projects__progress-label">
                  {project.progress}%
                </div>
              </div>

              <h4 className="projects__card-title">{project.title}</h4>
              <p className="projects__card-desc">{project.description}</p>

              <div className="projects__progress-bar">
                <div
                  className="projects__progress-fill"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="projects__tags">
                {project.tags.map((tag, j) => (
                  <span className="projects__tag" key={j}>
                    {tag}
                  </span>
                ))}
              </div>

              <a href="#contact" className="projects__card-link">
                Learn More <FiArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
