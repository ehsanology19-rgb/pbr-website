import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight } from 'react-icons/fi';
import './CTA.css';

export default function CTA() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section className="cta" ref={ref}>
      <div className="container">
        <motion.div
          className="cta__box"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="cta__pattern" aria-hidden="true">
            <div className="cta__circle cta__circle--1" />
            <div className="cta__circle cta__circle--2" />
          </div>

          <div className="cta__content">
            <h2 className="cta__title">
              Ready to Advance Your Research?
            </h2>
            <p className="cta__text">
              Whether you are a researcher, student, or institution — explore
              opportunities to collaborate with PBR on cutting-edge scientific
              projects. Together, we can push the boundaries of biomedical discovery.
            </p>
            <div className="cta__buttons">
              <a href="#contact" className="btn btn-primary">
                Start a Collaboration <FiArrowRight size={18} />
              </a>
              <a href="#research" className="btn btn-outline cta__btn-outline">
                View Our Research
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
