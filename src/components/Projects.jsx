import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import { getProjects } from '../lib/supabase';
import { useSupabaseQuery } from '../hooks/useSupabase';
import './Projects.css';

export default function Projects() {
  const { data: projects, loading } = useSupabaseQuery(getProjects, [], []);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Don't render section if no projects
  if (!loading && (!projects || projects.length === 0)) {
    return null;
  }

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

        {loading ? (
          <div className="projects__loading">Loading projects...</div>
        ) : (
          <div className="projects__grid">
            {projects.map((project, i) => {
              const tags = Array.isArray(project.tags) ? project.tags : [];
              return (
                <motion.div
                  className="projects__card"
                  key={project.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                >
                  <div className="projects__card-header">
                    <span
                      className={`projects__status projects__status--${(project.status || 'active').toLowerCase().replace(' ', '-')}`}
                    >
                      <FiClock size={12} />
                      {project.status || 'Active'}
                    </span>
                    <div className="projects__progress-label">
                      {project.progress || 0}%
                    </div>
                  </div>

                  <h4 className="projects__card-title">{project.title}</h4>
                  <p className="projects__card-desc">{project.description}</p>

                  <div className="projects__progress-bar">
                    <div
                      className="projects__progress-fill"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>

                  {tags.length > 0 && (
                    <div className="projects__tags">
                      {tags.map((tag, j) => (
                        <span className="projects__tag" key={j}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <a href="#contact" className="projects__card-link">
                    Learn More <FiArrowRight size={14} />
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
