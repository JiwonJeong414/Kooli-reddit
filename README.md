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

<img width="1710" alt="image" src="https://github.com/user-attachments/assets/f9c29b3a-577a-4031-9ae3-aac4860a4a12" />
<img width="1728" alt="Screenshot 2025-01-15 at 12 49 59 AM" src="https://github.com/user-attachments/assets/86a4c301-0099-48b0-b500-e134d411204f" />
<img width="1712" alt="Screenshot 2025-01-15 at 12 51 04 AM" src="https://github.com/user-attachments/assets/cf5598c0-ec26-465a-b5b1-d2082b0d67aa" />
<img width="1712" alt="Screenshot 2025-01-15 at 12 51 24 AM" src="https://github.com/user-attachments/assets/8fbb7739-69a6-47dc-8d58-bfba22595276" />
<img width="1712" alt="Screenshot 2025-01-15 at 12 51 51 AM" src="https://github.com/user-attachments/assets/d1b496a0-d704-47f0-8eea-88cf780a0441" />


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
