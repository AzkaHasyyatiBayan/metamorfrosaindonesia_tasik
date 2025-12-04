# Metamorfros Indonesia Tasik

A modern, full-stack event management and registration platform built with Next.js, React, and Supabase. This application provides a seamless experience for users to discover events, register for attendance, and enables administrators to manage events, track analytics, and showcase event galleries through an intuitive, responsive interface.

## Overview

Metamorfros Indonesia Tasik is a comprehensive web application designed to revolutionize how organizations manage events and engage with participants. The platform seamlessly combines a user-centric interface for event discovery and registration with a powerful admin dashboard for event orchestration, real-time analytics, and media management. Built on cutting-edge technologies and best practices, it delivers a scalable, performant, and secure solution suitable for event organizers of all sizes and participants seeking to discover meaningful experiences.

## Features

### User Features
- **Event Discovery**: Browse and filter events by category, date, location, and availability status
- **Event Registration**: Intuitive registration form with real-time validation and error handling
- **User Profiles**: Personalized profile management with registration history and account settings
- **About Section**: Comprehensive information about Metamorfros Indonesia and organizational mission
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices with adaptive layouts
- **Event Notifications**: Stay informed about registered events and upcoming activities

### Admin Features
- **Event Management**: Create, edit, update, and delete events with rich detail fields and multimedia support
- **Registration Dashboard**: Comprehensive view of all user registrations with filtering and export capabilities
- **Analytics Dashboard**: Track attendance rates, registration trends, user engagement metrics, and event performance
- **Gallery Management**: Upload, organize, and showcase event photos and media with easy management interface
- **User Authentication**: Secure role-based access control with password recovery and session management
- **Analytics Visualization**: Charts and graphs for quick insights into event performance and user engagement

## Technology Stack

- **Frontend Framework**: React 19 with Next.js 16 for server-side rendering, static generation, and optimized performance
- **Language**: TypeScript for type-safe, maintainable, and scalable code development
- **Styling**: Tailwind CSS with PostCSS for responsive, modern, and consistent UI design
- **Backend & Database**: Supabase with PostgreSQL for reliable data persistence and real-time capabilities
- **Validation**: Zod for robust runtime schema validation and type inference
- **Authentication**: Supabase Authentication with SSR support for secure and seamless user sessions
- **Deployment**: Docker and Docker Compose for containerized, reproducible environments
- **Linting**: ESLint for code quality maintenance and consistency

## Project Structure

```
app/
+-- layout.tsx              # Root layout with global styles and metadata
+-- page.tsx                # Home page with featured events
+-- middleware.ts           # Authentication and routing middleware
+-- admin/                  # Protected admin dashboard routes
�   +-- layout.tsx
�   +-- page.tsx           # Admin dashboard home and overview
�   +-- analytics/         # Event analytics and reporting
�   +-- events/            # Event CRUD operations
�   �   +-- create/        # Event creation interface
�   +-- galleries/         # Media and gallery management
�   +-- registrations/     # User registration management
+-- auth/                  # Authentication pages
�   +-- login/            # Login interface
�   +-- register/         # Registration interface
+-- user/                 # User-facing pages
�   +-- about/            # About page
�   +-- events/           # User's registered events
�   +-- profile/          # User profile management
+-- components/           # Reusable React components
�   +-- AuthProvider.tsx     # Authentication context provider
�   +-- NavBar.tsx           # Main navigation component
�   +-- AdminSidebar.tsx     # Admin panel sidebar navigation
�   +-- EventCard.tsx        # Event display card component
�   +-- EventFilter.tsx      # Event filtering interface
�   +-- EventList.tsx        # Event list container
�   +-- RegistrationForm.tsx # Registration form component
�   +-- FileUpload.tsx       # File upload to Supabase
�   +-- Charts.tsx           # Analytics visualization
�   +-- Button.tsx           # Reusable button component
�   +-- ErrorBoundary.tsx    # Error handling boundary
�   +-- Icons.tsx            # Icon components
+-- lib/                  # Utility functions and custom hooks
�   +-- auth.ts          # Authentication logic and utilities
�   +-- supabase.ts      # Supabase client initialization
�   +-- data.ts          # Data fetching utilities
�   +-- validation.ts    # Zod validation schemas
�   +-- hooks/           # Custom React hooks
�       +-- useEvents.ts         # Event data management
�       +-- useUserRegistrations.ts # Registration data management
+-- types/              # TypeScript type definitions
�   +-- database.types.ts # Generated database types
+-- globals.css         # Global stylesheet and Tailwind imports
```

## Getting Started

### Prerequisites
- **Node.js** v18 or higher with npm/yarn
- **Supabase** account with project setup for database and authentication
- **Docker** and Docker Compose (optional, for containerized deployment)
- **Git** for version control and repository management

### Installation & Setup

1. **Clone the repository**
   \\\ash
   git clone https://github.com/AzkaHasyyatiBayan/metamorfrosaindonesia_tasik.git
   cd metamorfrosaindonesia_tasik
   \\\

2. **Install dependencies**
   \\\ash
   npm install
   \\\

3. **Set up environment variables**
   Create a \.env.local\ file in the root directory with your Supabase credentials:
   \\\
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \\\

4. **Run the development server**
   \\\ash
   npm run dev
   \\\

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Available Scripts

- \
pm run dev\ - Start the development server with hot reload
- \
pm run build\ - Build the application for production
- \
pm start\ - Run the production server
- \
pm run lint\ - Run ESLint to check code quality

## Docker Deployment

Deploy the application using Docker Compose for consistent production environments:

```bash
docker-compose up --build
```

The application will be accessible at [http://localhost:3000](http://localhost:3000). Docker Compose automatically sources environment variables from `.env.local` and manages container lifecycle with automatic restart policies.

## Security & Best Practices

- **Authentication**: Server-side authentication with Supabase SSR integration
- **Authorization**: Middleware-enforced access control for protected admin routes
- **Validation**: Client-side and server-side validation using Zod schemas
- **Secrets Management**: Environment variables for all sensitive configuration
- **Type Safety**: Full TypeScript implementation for compile-time error detection
- **CORS & Image Optimization**: Whitelisted remote image sources from trusted CDNs

## Browser Support

The application is fully compatible with all modern browsers: Chrome, Firefox, Safari, Edge, and other Chromium-based browsers. Remote images are optimized from trusted sources including Supabase, Unsplash, Pixabay, Pexels, Imgur, and Bing.

## Contributing

Contributions are highly welcome! To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request with detailed description

## License

This project is private and maintained by the Metamorfros Indonesia development team.

## Contact & Support

For questions, bug reports, or feature requests, please open an issue in the repository or contact the development team directly.

---

**Developed with modern web technologies by the Metamorfros Indonesia Team**

