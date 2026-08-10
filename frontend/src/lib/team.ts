export interface StartupFounder {
  id?: string;
  name: string;
  role?: string | null;
  [key: string]: unknown;
}

export const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return "Team Member";
  const normalized = role.trim().replace(/\s+/g, " ").replace(/-/g, " ").toLowerCase();
  
  const displayMap: Record<string, string> = {
    "founder": "Founder",
    "co founder": "Co-Founder",
    "ceo": "CEO",
    "cto": "CTO",
    "cfo": "CFO",
    "coo": "COO",
    "cmo": "CMO",
  };
  
  if (displayMap[normalized]) return displayMap[normalized];
  
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ROLE_PRIORITY: Record<string, number> = {
  "Founder": 1,
  "Co-Founder": 2,
  "CEO": 3,
  "CTO": 4,
  "COO": 5,
  "CFO": 6,
  "CMO": 7,
};

export const groupTeamByRole = (members: StartupFounder[] | undefined): Record<string, StartupFounder[]> => {
  if (!members || members.length === 0) return {};
  
  return members.reduce((acc, member) => {
    const role = normalizeRole(member.role);
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, StartupFounder[]>);
};

export const sortGroupedRoles = (grouped: Record<string, StartupFounder[]>): string[] => {
  return Object.keys(grouped).sort((a, b) => {
    const prioA = ROLE_PRIORITY[a] || 999;
    const prioB = ROLE_PRIORITY[b] || 999;
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b);
  });
};

export const formatRoleDisplay = (role: string, count: number) => {
  if (count === 1) return role;
  if (role.toLowerCase().endsWith('s')) return role;
  return `${role}s`;
};
