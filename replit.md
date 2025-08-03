# Overview

The Cybersecurity Work Tracker is a Flask-based web application designed to help bug bounty hunters track their work sessions, earnings, and vulnerability discoveries through time-boxed challenges. The application features real-time activity monitoring, countdown timers, progress analytics, and comprehensive reporting capabilities with a cybersecurity-themed dark UI.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive design
- **Styling**: Custom CSS with cybersecurity theme (dark mode, neon colors, glowing effects)
- **JavaScript**: Vanilla JavaScript modules for activity tracking, charts, and real-time updates
- **Charts**: Chart.js integration for analytics visualization
- **UI Framework**: Bootstrap 5 with custom cybersecurity styling

## Backend Architecture
- **Framework**: Flask with modular route organization
- **Models**: SQLAlchemy ORM models (Challenge, Vulnerability, WorkSession, ActivityLog) with proper relationships
- **Database**: PostgreSQL with Flask-SQLAlchemy integration
- **Data Validation**: Server-side form validation with Flask
- **Session Management**: Flask sessions with configurable secret key
- **Logging**: Python logging module for debugging and monitoring
- **Middleware**: ProxyFix for handling reverse proxy headers

## Data Storage
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Tables**: Separate tables for challenges, vulnerabilities, work_sessions, and activity_logs with proper foreign key relationships
- **Schema**: Structured relational schema with datetime tracking and challenge relationships
- **Indexing**: Foreign key indexes for performance on challenge_id relationships

## Authentication & Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Basic Flask sessions for temporary state
- **Security**: Environment-based secret key configuration

## Real-time Features
- **Activity Tracking**: JavaScript-based mouse/keyboard activity monitoring with 5-minute intervals
- **Countdown Timers**: Client-side countdown displays with real-time updates
- **Progress Tracking**: Automatic calculation of challenge progress and work time accumulation
- **Auto-save**: Periodic saving of work session data to prevent data loss

## Time Management
- **Timezone Handling**: Integration with WorldTimeAPI for Cairo timezone synchronization
- **Work Sessions**: Automatic time tracking with activity-based validation
- **Progress Calculation**: Real-time progress bars based on elapsed time vs total duration

# External Dependencies

## Third-party Services
- **WorldTimeAPI**: Real-time timezone data for Cairo, Egypt time synchronization
- **Bootstrap CDN**: Frontend framework and components
- **Font Awesome**: Icon library for UI elements
- **Chart.js**: Data visualization and analytics charts

## Python Packages
- **Flask**: Web application framework
- **Flask-SQLAlchemy**: PostgreSQL database ORM
- **psycopg2-binary**: PostgreSQL database adapter
- **Requests**: HTTP client for external API calls
- **Werkzeug**: WSGI utilities and middleware
- **Gunicorn**: WSGI HTTP server for production deployment

## JavaScript Libraries
- **Bootstrap JS**: Interactive components and modals
- **Chart.js**: Analytics and progress visualization
- **Custom Modules**: Activity tracking, form validation, and real-time updates

## Database Services
- **PostgreSQL**: Relational database with ACID compliance and structured data
- **Connection**: Environment-configurable DATABASE_URL with connection pooling