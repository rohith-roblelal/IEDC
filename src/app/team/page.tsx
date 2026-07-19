"use client";

import { motion } from "framer-motion";

const TEAM = {
  faculty: [
    {
      name: 'Sajitha KS',
      role: 'Nodal Officer',
      meta: 'Assistant Professor, Department of Instrumentation and Control Engineering',
      email: '',
      photo: ''
    },
    {
      name: 'Dr. Chithra N.V',
      role: 'Assistant Nodal Officer',
      meta: 'Head of Department Mechanical Engineering',
      email: '',
      photo: ''
    }
  ],
  leadership: [
    {
      name: 'Feba Josy',
      role: 'Student Lead I',
      meta: '4th Year · ECE',
      email: '',
      photo: ''
    },
    {
      name: 'N Amjith Kumar',
      role: 'Assistant Lead II',
      meta: '4rd Year · CE',
      email: '',
      photo: ''
    }
  ],
  core: [
    { name: 'Amrith Raj', role: 'CFO', meta: '4th Year · ECE', email: '', photo: '' },
    { name: 'Gerom Aloshious', role: 'CMO', meta: '4th Year · EEE', email: '', photo: '' },
    { name: 'Amal krishna OU', role: 'CTO', meta: '4th Year · ECE', email: '', photo: '' },
    { name: 'Vasudev KS', role: 'CPO', meta: '3rd Year · CSE', email: '', photo: '' },
    { name: 'Nanditha MR', role: 'WEL', meta: '4th Year · ECE', email: '', photo: '' },
    { name: 'Jaims Aldrin D Cunja', role: 'COO', meta: '4th Year · ICE', email: '', photo: '' },
    { name: 'Shreyas KP', role: 'IPR ', meta: '4th Year - ECE', email: '', photo: '' },
    { name: ' lead', role: 'CCO', meta: ' Year - Dept', email: '', photo: ''},
  ],
  assistantLeads: [
    {
      name: 'Rohith Roblelal',
      role: 'Assistant CTO',
      meta: '2nd Year - CSE(Cyber Security)',
      email: '',
      photo: ''
    },
    {
      name: 'Ajay Ghosh M',
      role: 'Assistant CPO',
      meta: '2nd Year - CSE(Artificial Intelligence)',
      email: '',
      photo: ''
    },
    {
      name: 'Anni Esha Ashic',
      role: 'Assistant WEL',
      meta: '2nd Year - ICE',
      email: '',
      photo: ''
    },
    {
      name: 'Siva Sankar S.N',
      role: 'Assistant CCO',
      meta: '2nd Year - ICE',
      email: '',
      photo: ''
    }
  ]
};

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

function TeamCard({ member, featured }: { member: any, featured?: boolean }) {
  return (
    <motion.article
      whileHover={{ y: -5, borderColor: "rgba(139, 127, 232, 0.35)" }}
      className={`border border-white/10 rounded-[18px] text-center transition-colors ${featured
          ? "bg-[radial-gradient(circle_at_50%_0%,rgba(79,125,249,0.2),rgba(13,16,48,0.95))] border-[#4F7DF9]/25 py-8 px-6"
          : "bg-gradient-to-br from-[#3A2065]/40 to-[#0D1030]/85 py-7 px-5"
        }`}
    >
      <div className={`mx-auto mb-4 flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#3B82F6] to-[#A855F7] rounded-full overflow-hidden ${featured ? "w-[88px] h-[88px] text-[1.6rem]" : "w-[72px] h-[72px] text-[1.35rem]"
        }`}>
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          getInitials(member.name)
        )}
      </div>
      <span className={`inline-block text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2.5 ${featured ? "bg-[#22D46B]/15 text-[#22D46B]" : "bg-[#4F7DF9]/20 text-[#4F7DF9]"
        }`}>
        {member.role}
      </span>
      <h3 className={`font-bold leading-tight ${featured ? "text-[1.2rem]" : "text-[1.05rem]"}`}>
        {member.name}
      </h3>
      {member.meta && (
        <p className="mt-2 text-[#C4C4D4] text-[0.85rem] font-medium">{member.meta}</p>
      )}
      {member.email && (
        <div className="mt-3 text-[0.82rem]">
          <a href={`mailto:${member.email}`} className="text-[#8B7FE8] font-medium hover:text-white transition-colors">
            {member.email}
          </a>
        </div>
      )}
    </motion.article>
  );
}

export default function TeamPage() {
  return (
    <div className="py-24 px-6 relative max-w-[1100px] mx-auto">
      <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Team</h2>
      <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-12">
        Meet the faculty mentors and student leaders driving innovation and entrepreneurship at SNMIMT.
      </p>

      <div className="space-y-14">
        {/* Faculty */}
        <div>
          <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Faculty & Nodal Officers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-center max-w-[640px] mx-auto">
            {TEAM.faculty.map((m, i) => <TeamCard key={i} member={m} featured />)}
          </div>
        </div>

        {/* Leadership */}
        <div>
          <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Student Leadership</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-center max-w-[560px] mx-auto">
            {TEAM.leadership.map((m, i) => <TeamCard key={i} member={m} featured />)}
          </div>
        </div>

        {/* Core Team */}
        <div>
          <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Core Team</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {TEAM.core.map((m, i) => <TeamCard key={i} member={m} />)}
          </div>
        </div>

        {/* Assistant Leads */}
        <div>
          <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Assistant Leads</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 justify-center max-w-[800px] mx-auto">
            {TEAM.assistantLeads.map((m, i) => <TeamCard key={i} member={m} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
