import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { getExecutiveCommitteeMembers } from '../lib/supabase';
import { useSupabaseQuery } from '../hooks/useSupabase';
import Navbar from './Navbar';
import Footer from './Footer';
import './ExecutiveCommittee.css';

// Fallback data structure matching the user's requirements
const fallbackData = [
  // Advisor
  { name: 'Mahbubul Kabir Himel', position: 'Advisor', member_type: 'advisor', wing: null },
  
  // Executive Committee
  { name: 'Fahmid Khalil Rafil', position: 'President', member_type: 'executive', wing: null },
  { name: 'Sazidul Islam Sazid', position: 'Vice President (Administration)', member_type: 'executive', wing: null },
  { name: 'Nipatul Hasan Nirob', position: 'Vice President (Research)', member_type: 'executive', wing: null },
  { name: 'MD. Afif Ullah', position: 'General Secretary', member_type: 'executive', wing: null },
  { name: 'Mirza Tanzina Shanta', position: 'Joint Secretary', member_type: 'executive', wing: null },
  { name: 'Rifat Hossain Anik', position: 'Joint Secretary', member_type: 'executive', wing: null },
  { name: 'Al-Imran', position: 'Joint Secretary', member_type: 'executive', wing: null },
  { name: 'Anee Laskar', position: 'Joint Secretary', member_type: 'executive', wing: null },
  { name: 'Abdullah Al Nabil', position: 'Treasurer', member_type: 'executive', wing: null },
  { name: 'MD. Rubay Hossen Hridoy', position: 'Office Secretary', member_type: 'executive', wing: null },
  
  // Project Management Wing
  { name: 'Asif Sarker Apurbo', position: 'Secretary', member_type: 'wing', wing: 'Project Management Wing' },
  { name: 'Al Ashraful Nahid Hasan', position: 'Assistant Secretary', member_type: 'wing', wing: 'Project Management Wing' },
  
  // IT Wing
  { name: 'Ehsanul Islam', position: 'Secretary', member_type: 'wing', wing: 'IT Wing' },
  { name: 'Tasmima Haque Topa', position: 'Assistant Secretary', member_type: 'wing', wing: 'IT Wing' },
  
  // Promotion & Marketing Wing
  { name: 'Maruf Khan', position: 'Secretary', member_type: 'wing', wing: 'Promotion & Marketing Wing' },
  { name: 'Mohirun Nesa Meghla', position: 'Assistant Secretary', member_type: 'wing', wing: 'Promotion & Marketing Wing' },
  { name: 'Mysha Akter', position: 'Assistant Secretary', member_type: 'wing', wing: 'Promotion & Marketing Wing' },
  
  // Press & Publication Wing
  { name: 'MD. Ratul Hasan', position: 'Secretary', member_type: 'wing', wing: 'Press & Publication Wing' },
  { name: 'MD. Asif', position: 'Assistant Secretary', member_type: 'wing', wing: 'Press & Publication Wing' },
  
  // Public Relation, Networking & HR Wing
  { name: 'Abu Talha Chowdhury', position: 'Secretary', member_type: 'wing', wing: 'Public Relation, Networking & HR Wing' },
  { name: 'Upoma Sarwar', position: 'Assistant Secretary', member_type: 'wing', wing: 'Public Relation, Networking & HR Wing' },
  { name: 'Nishat Jahan', position: 'Assistant Secretary', member_type: 'wing', wing: 'Public Relation, Networking & HR Wing' },
  
  // Dry Lab Management Wing
  { name: 'MD. Mujahid Hossain', position: 'Secretary', member_type: 'wing', wing: 'Dry Lab Management Wing' },
  { name: 'MD. Faridul Islam', position: 'Assistant Secretary', member_type: 'wing', wing: 'Dry Lab Management Wing' },
];

function MemberCard({ name, position, index }) {
  return (
    <motion.div
      className="executive-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="executive-card__content">
        <h4 className="executive-card__name">{name}</h4>
        <p className="executive-card__position">{position}</p>
      </div>
    </motion.div>
  );
}

function Section({ title, members, isHighlighted = false }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  if (!members || members.length === 0) return null;
  
  return (
    <motion.section
      className={`executive-section ${isHighlighted ? 'executive-section--highlighted' : ''}`}
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h3 className="executive-section__title">{title}</h3>
      <div className="executive-section__grid">
        {members.map((member, i) => (
          <MemberCard
            key={member.id || i}
            name={member.name}
            position={member.position}
            index={i}
          />
        ))}
      </div>
    </motion.section>
  );
}

export default function ExecutiveCommittee() {
  const { data: committeeData, loading } = useSupabaseQuery(
    getExecutiveCommitteeMembers,
    [],
    fallbackData
  );
  
  const data = committeeData?.length > 0 ? committeeData : fallbackData;
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  // Group members by type and wing
  const advisor = data.filter(m => m.member_type === 'advisor');
  const executive = data.filter(m => m.member_type === 'executive');
  
  // Group wings
  const wings = {};
  data
    .filter(m => m.member_type === 'wing' && m.wing)
    .forEach(member => {
      if (!wings[member.wing]) {
        wings[member.wing] = [];
      }
      wings[member.wing].push(member);
    });
  
  return (
    <>
      <Navbar />
      <div className="executive-committee-page">
        <div className="container">
          <motion.div
            className="executive-committee__header"
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Executive Committee</span>
            <h1 className="executive-committee__title">PBR Executive Committee</h1>
            <p className="executive-committee__subtitle">
              Meet the dedicated leaders and members who guide Padma Bioresearch Organization
            </p>
          </motion.div>
          
          {loading && (
            <div className="executive-committee__loading">Loading committee members...</div>
          )}
          
          {!loading && (
            <>
              {/* Advisor Section - Highlighted */}
              {advisor.length > 0 && (
                <Section
                  title="Advisor"
                  members={advisor}
                  isHighlighted={true}
                />
              )}
              
              {/* Executive Committee Section */}
              {executive.length > 0 && (
                <Section
                  title="Executive Committee"
                  members={executive}
                />
              )}
              
              {/* Wing Sections */}
              {Object.keys(wings).map((wingName) => (
                <Section
                  key={wingName}
                  title={wingName}
                  members={wings[wingName]}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
