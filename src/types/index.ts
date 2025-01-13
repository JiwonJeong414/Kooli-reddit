export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    joinedDramas: {
        slug: string;
        joinedAt: Date;
    }[];
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
    _id?: string;
    title: string;
    slug: string;
    imageUrl: string;
    link: string;
    memberCount: number;
    createdAt: Date;
}

export interface Post {
    _id: string;
    title: string;
    content: string;
    author?: {
        id: string;
        username: string;
    };
    dramaId?: string;  // Reference to the drama
    dramaSlug?: string;  // URL-friendly drama name
    dramaTitle?: string;  // Drama title for display
    votes: number;
    voters: Vote[];
    createdAt: string | Date;
}
