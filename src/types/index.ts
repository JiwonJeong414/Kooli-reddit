export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    refreshToken?: string;
}

export interface Vote {
    userId: string;
    vote: 1 | -1;
}

export interface Post {
    _id: string;
    title: string;
    content: string;
    author?: {
        id: string;
        username: string;
    };
    subreddit?: string;
    votes: number;
    voters: Vote[];  // Changed from Comment[] to Vote[]
    createdAt: string | Date;
}

export interface Comment {
    _id: string;
    content: string;
    postId: string;
    author: {
        id: string;
        username: string;
    };
    votes: number;
    voters: Vote[];
    createdAt: Date;
}

export interface Drama {
    id: string;
    title: string;
    year: number;
    episodes: number;
    rating: number;
    description: string;
    imageUrl: string;
}