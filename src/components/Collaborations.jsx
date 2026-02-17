import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { FiGlobe } from 'react-icons/fi';
import './Collaborations.css';

const partners = [
  { name: 'National Institute of Pharmaceutical Research', type: 'Academic' },
  { name: 'Centre for Computational Biology', type: 'Research Lab' },
  { name: 'Global Biotech Alliance', type: 'Industry' },
  { name: 'Department of Pharmacology, State University', type: 'Academic' },
  { name: 'International Society of Molecular Modeling', type: 'Scientific Body' },
  { name: 'Asia-Pacific Drug Discovery Network', type: 'Research Network' },
];

export default function Collaborations() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="collabs" id="collaborations" ref={ref}>
      <div className="container">
        <div className="collabs__layout">
          <motion.div
            className="collabs__left"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label">Collaborations & Partners</span>
            <h2 className="section-title">Building Bridges Across the Scientific Community</h2>
            <p className="section-subtitle">
              We believe in the power of collaborative research. PBR works with
              leading universities, research institutions, and industry partners
              to advance shared scientific goals and create lasting impact.
            </p>
            <div className="collabs__stats">
              <div className="collabs__stat">
                <FiGlobe size={20} className="collabs__stat-icon" />
                <div>
                  <strong>6+</strong>
                  <span>Partner Institutions</span>
                </div>
              </div>
              <div className="collabs__stat">
                <HiOutlineOfficeBuilding size={20} className="collabs__stat-icon" />
                <div>
                  <strong>3</strong>
                  <span>Collaboration Types</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="collabs__right"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="collabs__grid">
              {partners.map((partner, i) => (
                <motion.div
                  className="collabs__card"
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                >
                  <div className="collabs__card-logo">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="collabs__card-name">{partner.name}</h4>
                    <span className="collabs__card-type">{partner.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
