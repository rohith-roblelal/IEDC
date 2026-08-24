"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

export function TeamCard({ member, featured }: { member: any, featured?: boolean }) {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      className={`border rounded-[18px] text-center transition-colors ${featured
          ? "bg-[radial-gradient(circle_at_50%_0%,rgba(79,125,249,0.2),rgba(13,16,48,0.95))] border-[#4F7DF9]/25 hover:border-[#4F7DF9]/50 py-8 px-6"
          : "bg-gradient-to-br from-[#3A2065]/40 to-[#0D1030]/85 border-white/10 hover:border-[#8B7FE8]/35 py-7 px-5"
        }`}
    >
      <div className={`mx-auto mb-4 flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#3B82F6] to-[#A855F7] rounded-full overflow-hidden ${featured ? "w-[88px] h-[88px] text-[1.6rem]" : "w-[72px] h-[72px] text-[1.35rem]"
        }`}>
        {member.photo_url ? (
          <div className="w-full h-full relative">
            <Image src={member.photo_url} alt={member.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        ) : (
          getInitials(member.name)
        )}
      </div>
      <span className={`inline-block text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2.5 ${featured ? "bg-[#22D46B]/15 text-[#22D46B]" : "bg-[#4F7DF9]/20 text-[#4F7DF9]"
        }`}>
        {member.role_title}
      </span>
      <h3 className={`font-bold leading-tight ${featured ? "text-[1.2rem]" : "text-[1.05rem]"}`}>
        {member.name}
      </h3>
      {(member.department || member.year) && (
        <p className="mt-2 text-[#C4C4D4] text-[0.85rem] font-medium">
          {[member.year, member.department].filter(Boolean).join(" · ")}
        </p>
      )}
      <div className="mt-3 flex items-center justify-center gap-3">
        {member.email && (
          <a href={`mailto:${member.email}`} className="text-[#8B7FE8] text-[0.82rem] font-medium hover:text-white transition-colors">
            Email
          </a>
        )}
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#8B7FE8] text-[0.82rem] font-medium hover:text-white transition-colors">
            LinkedIn
          </a>
        )}
        {member.instagram_url && (
          <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="text-[#8B7FE8] text-[0.82rem] font-medium hover:text-white transition-colors">
            Instagram
          </a>
        )}
      </div>
    </motion.article>
  );
}
