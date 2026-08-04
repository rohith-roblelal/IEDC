<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architectural Decisions (Approved)

The following decisions are final and do not require further confirmation.

## Optimization Strategy

Implement improvements in the following order:

1. Critical security issues
2. Backend architecture
3. Database integrity
4. Frontend architecture
5. UI/UX improvements
6. Performance optimization
7. Final visual polish

Never prioritize cosmetic improvements over security, reliability, maintainability, or scalability.

---

## Component Library

The project standard is:

- shadcn/ui
- Radix UI primitives
- Tailwind CSS
- Lucide Icons

Do not introduce additional UI frameworks (MUI, Ant Design, Mantine, Chakra, NextUI, etc.).

Custom components should only be created when a suitable shadcn component does not exist.

Maintain a single, consistent design system across the entire application.

---

## Engineering Principle

Do not pause implementation to ask architectural questions that have already been defined.

Use senior engineering judgment and proceed with the implementation while following enterprise software engineering best practices
