import enum

class Role(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"

class EventStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    REGISTRATION_OPEN = "REGISTRATION_OPEN"
    REGISTRATION_CLOSED = "REGISTRATION_CLOSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class StartupStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ALUMNI = "ALUMNI"
    INACTIVE = "INACTIVE"
    CLOSED = "CLOSED"

class StartupRegistrationStatus(str, enum.Enum):
    REGISTERED = "REGISTERED"
    UNREGISTERED = "UNREGISTERED"
    INCORPORATED = "INCORPORATED"

class StartupStage(str, enum.Enum):
    IDEA = "IDEA"
    PROTOTYPE = "PROTOTYPE"
    MVP = "MVP"
    EARLY_REVENUE = "EARLY_REVENUE"
    SCALING = "SCALING"

class TeamCategory(str, enum.Enum):
    NODAL_OFFICER = "Nodal Officer"
    ASSISTANT_NODAL_OFFICER = "Assistant Nodal Officer"
    STUDENT_LEADERSHIP = "Student Leadership"
    CORE_TEAM = "Core Team (Execom)"
    ASSISTANT_LEADS = "Assistant Leads"
