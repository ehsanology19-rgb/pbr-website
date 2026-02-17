import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend,
  FiLoader,
} from 'react-icons/fi';
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaResearchgate,
} from 'react-icons/fa';
import { submitContactForm } from '../lib/supabase';
import { useSupabaseMutation } from '../hooks/useSupabase';
import './Contact.css';

const contactInfo = [
  {
    icon: <FiMail size={20} />,
    label: 'Email Us',
    value: 'padmabioresearch@gmail.com',
    href: 'mailto:padmabioresearch@gmail.com',
  },
  {
    icon: <FiPhone size={20} />,
    label: 'Call Us',
    value: '+880 1303-948311',
    href: 'tel:+8801303948311',
  },
  {
    icon: <FiMapPin size={20} />,
    label: 'Visit Us',
    value: 'Jahangirnagar University, Dhaka',
    href: 'https://maps.google.com/?q=Jahangirnagar+University+Dhaka',
  },
];

const socials = [
  { icon: <FaFacebookF size={16} />, href: 'https://www.facebook.com/share/1BXxEYaKui/', label: 'Facebook' },
  { icon: <FaLinkedinIn size={16} />, href: '#', label: 'LinkedIn' },
  { icon: <FaTwitter size={16} />, href: '#', label: 'Twitter' },
  { icon: <FaResearchgate size={16} />, href: '#', label: 'ResearchGate' },
];

export default function Contact() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const { mutate: submitForm, loading: isSubmitting } = useSupabaseMutation(submitContactForm);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear status when user starts typing again
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await submitForm(formData);
    
    if (error) {
      setSubmitStatus('error');
      console.error('Failed to submit contact form:', error);
    } else {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="container">
        <motion.div
          className="contact__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Contact Us</span>
          <h2 className="section-title">Let's Connect</h2>
          <p className="section-subtitle">
            Have a research query, collaboration proposal, or wish to join our
            team? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="contact__grid">
          <motion.div
            className="contact__info"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="contact__info-cards">
              {contactInfo.map((item, i) => (
                <a
                  href={item.href}
                  className="contact__info-card"
                  key={i}
                >
                  <div className="contact__info-icon">{item.icon}</div>
                  <div>
                    <span className="contact__info-label">{item.label}</span>
                    <strong className="contact__info-value">{item.value}</strong>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact__socials">
              <p className="contact__socials-label">Follow Us</p>
              <div className="contact__socials-list">
                {socials.map((s, i) => (
                  <a
                    href={s.href}
                    className="contact__social"
                    key={i}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.form
            className="contact__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="contact__form-row">
              <div className="contact__field">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="contact__field">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
            <div className="contact__field">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Research Collaboration / Join Team / General Inquiry"
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your research interest or inquiry..."
                required
              />
            </div>
            {submitStatus === 'success' && (
              <div className="contact__status contact__status--success">
                Thank you for your message! We will get back to you soon.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="contact__status contact__status--error">
                Something went wrong. Please try again or email us directly.
              </div>
            )}
            <button 
              type="submit" 
              className="btn btn-primary contact__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Sending... <FiLoader size={16} className="spin" /></>
              ) : (
                <>Send Message <FiSend size={16} /></>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
