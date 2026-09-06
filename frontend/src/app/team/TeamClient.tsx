"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

import { TeamCard } from "@/components/TeamCard";

function getGridClass(count: number, maxCols: number = 4) {
  if (count === 1) return "grid grid-cols-1 max-w-[320px] mx-auto";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-[640px] mx-auto";
  if (count === 3 && maxCols >= 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[960px] mx-auto";
  if (maxCols === 3) return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[960px] mx-auto";
  return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto";
}

export default function TeamClient({ initialTeam = [] }: { initialTeam?: any[] }) {
  const [team, setTeam] = useState<any[]>(initialTeam);

  const nodalOfficers = team.filter(m => m.category === "Nodal Officer" && m.is_published);
  const assistantNodalOfficers = team.filter(m => m.category === "Assistant Nodal Officer" && m.is_published);
  const leadership = team.filter(m => m.category === "Student Leadership" && m.is_published);
  const core = team.filter(m => m.category === "Core Team (Execom)" && m.is_published);
  const assistantLeads = team.filter(m => m.category === "Assistant Leads" && m.is_published);

  const allNodalOfficers = [...nodalOfficers, ...assistantNodalOfficers];

  return (
    <div className="py-24 px-6 relative max-w-[1100px] mx-auto">
      <h1 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Team</h1>
      <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-12">
        Meet the faculty mentors and student leaders driving innovation and entrepreneurship at SNMIMT.
      </p>

      <div className="space-y-14">
          {allNodalOfficers.length > 0 && (
            <div>
              <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Nodal officer & Assistant Nodal officer</p>
              <div className={`${getGridClass(allNodalOfficers.length, 2)} gap-5`}>
                {allNodalOfficers.map((m, i) => <TeamCard key={i} member={m} featured />)}
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
              <p className="text-center text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#8B7FE8] mb-6">Core Team (Execom)</p>
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
        </div>
    </div>
  );
}
