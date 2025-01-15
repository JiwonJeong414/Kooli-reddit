# KOOLi Forum 🎬

A K-Drama community platform developed during my 8-week winter internship at KOOLi Inc! 👥 ✨

🌐 **[Visit the KOOLi Forum](https://kooli-forum.vercel.app/)**

## About The Project

This project was developed as part of KOOLi Inc's winter internship program, focusing on creating a modern community platform for K-drama enthusiasts. The platform enables users to engage in discussions, share reviews, and connect with fellow K-drama fans in a sleek, user-friendly environment utilizing KOOLi's DramaLists database.

## Features & Implementation

### Community Management
- Dynamic drama communities with real-time member tracking
- Automated drama data collection with web scraping
- Custom color generation for each drama community
- Member statistics and engagement tracking

### User System
- **Authentication Routes**
    - `/api/login`: Email/username and password-based authentication
    - `/api/signup`: New user registration with validation

- **User Features**
    - `/api/users/stats`: Track user engagement metrics
    - `/api/users/dramas`: Manage joined drama communities

### Content Management
- **Posts System**
    - `/api/posts`: Create and fetch community posts
    - `/api/posts/[id]`: Individual post management
    - `/api/posts/vote`: Interactive voting system

- **Comments System**
    - `/api/comments`: Thread discussions and interactions

### Drama Communities
- **Community Routes**
    - `/api/dramas`: List and discover drama communities
    - `/api/dramas/[slug]`: Individual drama details
    - `/api/dramas/[slug]/membership`: Join/leave communities

## Tech Stack

- **Frontend Development**
    - Next.js with TypeScript for type-safe development
    - Tailwind CSS for modern, responsive styling
    - React Hooks for state management

- **Backend Systems**
    - Node.js server environment
    - MongoDB for flexible data storage
    - RESTful API architecture

- **Deployment & Infrastructure**
    - Vercel for seamless deployment
    - MongoDB Atlas for database hosting