"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/settings-context";
import Image from "next/image";
import { TeamCard } from "@/components/TeamCard";
import { Lightbulb, Users, Globe2, Rocket, ArrowRight, Quote } from "lucide-react";

export default function AboutClient() {
  const settings = useSettings();
  const [team, setTeam] = useState<any[]>([]);

  const ds = settings?.derived_stats || {};
  const rawStats = settings?.about_stats_json || [
    { label: "Events", source: "auto_events", suffix: "+" },
    { label: "Projects", source: "auto_projects", suffix: "+" },
    { label: "Workshops", source: "auto_workshops", suffix: "+" },
    { label: "Partners", source: "auto_partners", suffix: "+" },
  ];

  const processedStats = rawStats.map((stat: any) => {
    let finalValue = stat.value || "0";
    if (stat.source === "auto_events") finalValue = ds.events || 0;
    else if (stat.source === "auto_projects") finalValue = ds.projects || 0;
    else if (stat.source === "auto_workshops") finalValue = ds.workshops || 0;
    else if (stat.source === "auto_partners") finalValue = ds.partners || 0;
    
    return {
      label: stat.label,
      value: `${finalValue}${stat.suffix || ""}`
    };
  });

  const displayStats = processedStats;

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/v1/team");
        if (res.ok) {
          const data = await res.json();
          setTeam(data.items || (Array.isArray(data) ? data : []));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeam();
  }, []);

  // Filter for exact leadership roles per the requirements
  const leadershipRoles = [
    "Nodal Officer",
    "Assistant Nodal Officer",
    "Student Lead I",
    "Student Lead II",
    "Student Leadership",
    "Student Leadership I",
    "Student Leadership II",
  ];
  const featuredTeam = team.filter(m => 
    m.is_published && 
    (leadershipRoles.includes(m.role_title) || leadershipRoles.includes(m.category))
  ).slice(0, 4); // Show maximum 4 on the about page

  const iconMap: Record<string, React.ReactNode> = {
    "lightbulb": <Lightbulb size={24} className="text-[#8B7FE8]" />,
    "users": <Users size={24} className="text-[#8B7FE8]" />,
    "globe-2": <Globe2 size={24} className="text-[#8B7FE8]" />,
    "rocket": <Rocket size={24} className="text-[#8B7FE8]" />
  };

  const values = settings?.about_values_json || [
    {
      title: "Creativity",
      desc: "Turn ideas into meaningful solutions.",
      icon: "lightbulb"
    },
    {
      title: "Mentorship",
      desc: "Learn, guide, collaborate, and grow together.",
      icon: "users"
    },
    {
      title: "Sustainability",
      desc: "Build solutions that create lasting impact.",
      icon: "globe-2"
    },
    {
      title: "Leadership",
      desc: "Take initiative and create positive change.",
      icon: "rocket"
    }
  ];

  return (
    <div className="pb-24">
      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-16 px-6 max-w-[1100px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#8B7FE8] mb-4">
            ABOUT IEDC
          </span>
          <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-tight mb-6">
            {settings.about_hero_title || "Empowering the Next Generation of "}
            <span className="text-[#8B7FE8]">{settings.about_hero_highlight || "Innovators"}</span>
          </h1>
          {settings.about_description?.trim() && (
            <p className="max-w-[720px] mx-auto text-[#C4C4D4] text-[1.1rem] leading-relaxed">
              {settings.about_description}
            </p>
          )}
        </motion.div>
      </section>

      {/* 2. IMPACT STATISTICS */}
      {displayStats.length > 0 && (
        <section className="px-6 mb-24 max-w-[1200px] mx-auto">
          <div className={`grid gap-4 md:gap-6 ${
            displayStats.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 
            displayStats.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 
            displayStats.length === 3 ? 'grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto' : 
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {displayStats.map((stat: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] backdrop-blur-md border border-white/10 border-t-purple-500/30 rounded-2xl py-8 px-6 text-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_0_20px_rgba(139,127,232,0.15)]"
              >
                <div className="text-[2.5rem] font-extrabold text-white leading-none mb-2">{stat.value}</div>
                <div className="text-[#C4C4D4] font-medium text-[0.9rem] uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. INSPIRATION */}
      <section className="px-6 mb-24 max-w-[1000px] mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#8B7FE8]">
              INSPIRATION
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Ideas That Inspire Action
            </h2>
            <blockquote className="text-xl md:text-2xl font-medium text-[#C4C4D4] italic leading-relaxed border-l-2 border-[#8B7FE8] pl-6 py-2">
              {settings?.about_inspiration_quote || "\"Creativity is just connecting things\""}
            </blockquote>
            <cite className="block text-white font-semibold uppercase tracking-wider text-sm">
              — {settings?.about_inspiration_author || "Steve Jobs"}
            </cite>
          </div>
          <div className="w-full md:w-[320px] shrink-0">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                src={settings?.about_inspiration_image_url || "https://iedcsnmimt.vercel.app/static/media/steve.0ead07c00054eb156af5.png"}
                alt={settings?.about_inspiration_author || "Inspiration Portrait"} 
                fill
                sizes="(max-width: 768px) 100vw, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1030]/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR VALUES */}
      <section className="px-6 mb-24 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#8B7FE8] mb-3">
            GUIDING PRINCIPLES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">Our Values</h2>
        </div>
        <div className={`grid gap-6 ${
          values.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 
          values.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' : 
          values.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto' : 
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {values.map((val: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#3A2065]/20 to-transparent border border-white/5 hover:border-white/10 rounded-2xl p-8 backdrop-blur-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                {iconMap[val.icon] || <Quote size={24} className="text-[#8B7FE8]" />}
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-[#C4C4D4] text-sm leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. OUR VISION */}
      {settings.about_vision?.trim() && (
        <section className="px-6 mb-32 max-w-[900px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-1 rounded-3xl bg-gradient-to-b from-[#8B7FE8]/30 to-transparent"
          >
            <div className="absolute inset-0 bg-[#8B7FE8]/10 blur-3xl -z-10 rounded-full" />
            <div className="bg-[#0D1030] rounded-[22px] p-8 md:p-14 text-center border border-[#8B7FE8]/20">
              <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#8B7FE8] mb-6">
                OUR VISION
              </span>
              <p className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white leading-snug">
                {settings.about_vision}
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* 6. OUR TEAM */}
      {featuredTeam.length > 0 && (
        <section className="px-6 mb-24 max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#8B7FE8] mb-3">
              OUR TEAM
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The People Behind IEDC</h2>
            <p className="text-[#C4C4D4] max-w-[600px] mx-auto">
              Meet the leadership team driving innovation and entrepreneurship at SNMIMT.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featuredTeam.map((member, i) => (
              <TeamCard key={member.id || i} member={member} featured={false} />
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/team" 
              className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-white/10 transition-colors"
            >
              Meet the Full Team <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* 7. CLOSING CTA */}
      <section className="px-6 max-w-[1000px] mx-auto text-center mb-12">
        <div className="bg-gradient-to-r from-[#3A2065]/50 via-[#8B7FE8]/20 to-[#3A2065]/50 border border-white/10 rounded-3xl p-10 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Innovate?</h2>
          <p className="text-[#C4C4D4] max-w-[500px] mx-auto mb-8">
            Join our upcoming events, participate in workshops, and start building the future today.
          </p>
          <Link 
            href="/events" 
            className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-8 rounded-full hover:-translate-y-0.5 transition-transform shadow-[0_0_20px_rgba(34,212,107,0.3)] hover:shadow-[0_0_30px_rgba(34,212,107,0.5)]"
          >
            Explore Events
          </Link>
        </div>
      </section>
    </div>
  );
}
