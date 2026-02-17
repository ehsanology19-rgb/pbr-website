import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineGlobe,
  HiOutlineStar,
} from 'react-icons/hi';
import { FiExternalLink } from 'react-icons/fi';
import { getPublications } from '../lib/supabase';
import { useSupabaseQuery } from '../hooks/useSupabase';
import './Publications.css';

const achievements = [
  {
    icon: <HiOutlineDocumentText size={28} />,
    value: '50+',
    title: 'Research Papers',
    desc: 'Published in peer-reviewed national and international journals',
  },
  {
    icon: <HiOutlineAcademicCap size={28} />,
    value: '25+',
    title: 'Conference Presentations',
    desc: 'Showcased at leading biomedical and pharmaceutical conferences',
  },
  {
    icon: <HiOutlineGlobe size={28} />,
    value: '15+',
    title: 'Collaborative Projects',
    desc: 'With universities, research labs, and industry partners worldwide',
  },
  {
    icon: <HiOutlineStar size={28} />,
    value: '10+',
    title: 'Awards & Recognitions',
    desc: 'For outstanding contributions to bioresearch and mentorship',
  },
];

export default function Publications() {
  const { data: publications, loading } = useSupabaseQuery(
    () => getPublications({ featured: true, limit: 6 }),
    [],
    []
  );
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="publications" id="publications" ref={ref}>
      <div className="container">
        <motion.div
          className="publications__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Publications & Achievements</span>
          <h2 className="section-title">Impactful Research, Recognized Globally</h2>
          <p className="section-subtitle">
            Our work has been published in reputed journals and recognized at
            international forums — a testament to the quality and rigor of our
            research methodology.
          </p>
        </motion.div>

        {/* Achievement counters */}
        <div className="publications__achievements">
          {achievements.map((item, i) => (
            <motion.div
              className="publications__achievement"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <div className="publications__achievement-icon">{item.icon}</div>
              <div className="publications__achievement-value">{item.value}</div>
              <h4 className="publications__achievement-title">{item.title}</h4>
              <p className="publications__achievement-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured publications - only show if we have real data */}
        {!loading && publications && publications.length > 0 && (
          <motion.div
            className="publications__list-section"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="publications__list-heading">Featured Publications</h3>
            <div className="publications__list">
              {publications.map((pub) => {
                const pubType = pub.publication_type || 'Research';
                const typeClass = pubType.replace(/\s+/g, '-').toLowerCase();
                return (
                  <div className="publications__item" key={pub.id}>
                    <div className="publications__item-left">
                      <span className={`publications__item-type publications__item-type--${typeClass}`}>
                        {pubType}
                      </span>
                      <span className="publications__item-year">{pub.year}</span>
                    </div>
                    <div className="publications__item-content">
                      <h4 className="publications__item-title">{pub.title}</h4>
                      <p className="publications__item-journal">{pub.journal}</p>
                    </div>
                    {(pub.doi || pub.external_link) && (
                      <a
                        href={pub.external_link || `https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="publications__item-link-btn"
                        aria-label="View publication"
                      >
                        <FiExternalLink size={18} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="publications__loading">Loading publications...</div>
        )}
      </div>
    </section>
  );
}
