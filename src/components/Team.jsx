import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiLinkedin, FiMail } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { getTeamMembers } from '../lib/supabase';
import { useSupabaseQuery } from '../hooks/useSupabase';
import './Team.css';

// Fallback data (used while loading or if database is empty)
const fallbackTeam = [
  {
    name: 'Dr. Ananya Sharma',
    role: 'Lead Research Supervisor',
    specialization: 'Computational Drug Design & Molecular Dynamics',
    initials: 'AS',
    avatar_color: '#0D5C63',
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Senior Research Advisor',
    specialization: 'Pharmacology & Preclinical Research',
    initials: 'RK',
    avatar_color: '#0A2540',
  },
  {
    name: 'Priya Mehta, M.Pharm',
    role: 'Research Coordinator',
    specialization: 'In Vitro Bioassays & Cell Biology',
    initials: 'PM',
    avatar_color: '#164B60',
  },
  {
    name: 'Vikram Singh, M.Sc',
    role: 'Computational Biologist',
    specialization: 'Machine Learning & Bioinformatics',
    initials: 'VS',
    avatar_color: '#1A5653',
  },
  {
    name: 'Dr. Neha Patel',
    role: 'Molecular Biology Lead',
    specialization: 'Genomics & Biomarker Discovery',
    initials: 'NP',
    avatar_color: '#2D3A4A',
  },
  {
    name: 'Arjun Rao, M.Tech',
    role: 'Data Scientist',
    specialization: 'Statistical Modeling & AI in Drug Discovery',
    initials: 'AR',
    avatar_color: '#0B3D42',
  },
];

export default function Team() {
  // Fetch team members from Supabase, use fallback if empty or error
  const { data: teamData, loading } = useSupabaseQuery(getTeamMembers, [], fallbackTeam);
  const team = teamData?.length > 0 ? teamData : fallbackTeam;
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="team" id="team" ref={ref}>
      <div className="container">
        <motion.div
          className="team__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Our Team</span>
          <h2 className="section-title">Expert Researchers & Supervisors</h2>
          <p className="section-subtitle">
            PBR is guided by a team of experienced scientists, researchers, and
            mentors — each bringing specialized expertise across computational
            biology, pharmacology, and laboratory sciences.
          </p>
        </motion.div>

        <div className="team__grid">
          {team.map((member, i) => (
            <motion.div
              className="team__card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
            >
              <div
                className="team__avatar"
                style={!member.photo_url ? { background: member.avatar_color || member.color } : undefined}
              >
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="team__avatar-img" />
                ) : (
                  <span>{member.initials || member.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <h4 className="team__name">{member.name}</h4>
              <p className="team__role">{member.role}</p>
              <div className="team__specialization">
                <HiOutlineAcademicCap size={14} />
                <span>{member.specialization}</span>
              </div>
              <div className="team__socials">
                {member.linkedin_url && (
                  <a href={member.linkedin_url} className="team__social" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                    <FiLinkedin size={16} />
                  </a>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="team__social" aria-label="Email">
                    <FiMail size={16} />
                  </a>
                )}
                {!member.linkedin_url && !member.email && (
                  <>
                    <a href="#" className="team__social" aria-label="LinkedIn">
                      <FiLinkedin size={16} />
                    </a>
                    <a href="#" className="team__social" aria-label="Email">
                      <FiMail size={16} />
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="team__cta"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href="/executive-committee" className="btn btn-outline">
            Full Executive Committee
          </a>
        </motion.div>
      </div>
    </section>
  );
}
