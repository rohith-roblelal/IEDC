# Product Requirements Document (PRD)

## 1. Project Overview
IEDC SNMIMT is a web application designed for the college's Innovation and Entrepreneurship Development Cell. Its primary goal is to provide a centralized platform for students to view and register for club events, learn about the club's vision, and see the team members.

## 2. Target Users

**Primary Users – College Students**
Students of SNM Institute of Management and Technology (SNMIMT) who wish to participate in events organized by the Innovation and Entrepreneurship Development Cell (IEDC).
Their goals include:
- Browse upcoming IEDC events.
- View event details (date, time, venue, speakers, and description).
- Register for workshops, hackathons, bootcamps, and competitions.
- Receive event updates and notifications.
- View their registered events.
- Download participation certificates (future release).

**Secondary Users – IEDC Coordinators**
Student coordinators responsible for organizing and managing IEDC activities.
Their responsibilities include:
- Create and publish events.
- Monitor registrations.
- Update event information.
- Manage participant lists.
- Track attendance.
- Communicate announcements to participants.

**Faculty Coordinators**
Faculty members supervising IEDC activities.
Their responsibilities include:
- Review and approve events.
- Monitor student participation.
- View event reports and statistics.
- Support event management.

**System Administrator**
The administrator responsible for managing the entire platform.
Responsibilities include:
- Manage users and roles.
- Manage events.
- Monitor registrations.
- Generate reports.
- Manage website content.
- Maintain system settings.

### User Personas
| User | Description | Main Actions |
| :--- | :--- | :--- |
| **Student** | College student participating in IEDC events | View events, register, receive updates |
| **Coordinator** | Student organizer | Create events, manage registrations, update event information |
| **Faculty** | Faculty mentor | Review events, monitor participation, access reports |
| **Admin** | Website administrator | Manage users, events, announcements, and analytics |

### Target Audience
The platform is designed primarily for college students of SNM Institute of Management and Technology (SNMIMT) to simplify participation in IEDC-conducted events, workshops, hackathons, startup initiatives, seminars, and innovation programs. It also provides organizers with a centralized system for managing events and registrations efficiently.

## 3. Key Features
- **Event Management & Registration**:
  - Students can view upcoming events.
  - Registration forms for students to enroll in events using their college register number.
  - Validation to prevent duplicate registrations for the same event by the same student.
- **Multi-Page Layout**:
  - `index.html`: The landing page with hero banner and quick access to events.
  - `events.html`: Dedicated page for listing events and handling registrations.
  - `about.html`: Information about the IEDC, its vision, and statistics.
  - `team.html`: Profiles of faculty and student leadership.
- **Responsive Design**:
  - The website must be fully responsive and optimized for mobile and desktop screens.

## 4. Design Specifications
### Colors
- **Backgrounds**: 
  - Primary: Deep navy/near-black (`#0A0E27` to `#0D1030`)
  - Footer: Pure/near-black (`#0A0A0F`)
- **Gradients**: 
  - Hero Card: Dark purple to deep navy (`#3D1A5C` / `#4A1A6B` blending to `#0D1030`)
  - Logo: Blue (`#3B82F6`) to Purple (`#A855F7`) to Orange (`#F97316`)
- **Accents**: 
  - Bright Green: `#22D46B` / `#2ECC71`
  - Blue: `#4F7DF9` / `#3B82F6`
  - Dark Purple: `#3A2065` / `#2D1B4E`
  - Purple/Blue Heading Accent: `#8B7FE8` / `#7C6FF0`
- **Neutrals**:
  - White: `#FFFFFF`
  - Light Gray (Body Text): `#C4C4D4` / `#B8B8C8`

### Typography
- **Headings & Body**: Poppins (or similar rounded, geometric sans-serif)
- **Styling**: Bold, generous letter spacing for headings; regular/medium for body and nav links.
