"use client";

import { motion } from "framer-motion";

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        {member.image_url ? (
          <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          getInitials(member.name)
        )}
      </div>
      <span className={`inline-block text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2.5 ${featured ? "bg-[#22D46B]/15 text-[#22D46B]" : "bg-[#4F7DF9]/20 text-[#4F7DF9]"
        }`}>
        {member.position}
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

function getGridClass(count: number, maxCols: number = 4) {
  if (count === 1) return "grid grid-cols-1 max-w-[320px] mx-auto";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-[640px] mx-auto";
  if (count === 3 && maxCols >= 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[960px] mx-auto";
  if (maxCols === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[960px] mx-auto";
  return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TeamClient({ team }: { team: any[] }) {
  // Group explicitly by the new Category field
  const faculty = team.filter(m => m.category === "Faculty & Nodal Officers");
  const leadership = team.filter(m => m.category === "Student Leadership");
  const core = team.filter(m => m.category === "Core Team");
  const assistantLeads = team.filter(m => m.category === "Assistant Leads");
  const others = team.filter(m => m.category === "Members" || !m.category);

  return (
    <div className="py-24 px-6 relative max-w-[1100px] mx-auto">
      <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Team</h2>
      <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-12">
        Meet the faculty mentors and student leaders driving innovation and entrepreneurship at SNMIMT.
      </p>

      <div className="space-y-14">
        {faculty.length > 0 && (
          <div>
            <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Faculty & Nodal Officers</p>
            <div className={`${getGridClass(faculty.length, 2)} gap-5`}>
              {faculty.map((m, i) => <TeamCard key={i} member={m} featured />)}
            </div>
          </div>
        )}

        {leadership.length > 0 && (
          <div>
            <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Student Leadership</p>
            <div className={`${getGridClass(leadership.length, 2)} gap-5`}>
              {leadership.map((m, i) => <TeamCard key={i} member={m} featured />)}
            </div>
          </div>
        )}

        {core.length > 0 && (
          <div>
            <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Core Team</p>
            <div className={`${getGridClass(core.length, 4)} gap-5`}>
              {core.map((m, i) => <TeamCard key={i} member={m} />)}
            </div>
          </div>
        )}

        {assistantLeads.length > 0 && (
          <div>
            <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Assistant Leads</p>
            <div className={`${getGridClass(assistantLeads.length, 3)} gap-5`}>
              {assistantLeads.map((m, i) => <TeamCard key={i} member={m} />)}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Members</p>
            <div className={`${getGridClass(others.length, 3)} gap-5`}>
              {others.map((m, i) => <TeamCard key={i} member={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
