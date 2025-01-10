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

export interface Post {
    _id: string;
    title: string;
    content: string;
    author?: User;
    subreddit?: string;
    votes: number;
    comments: Comment[];
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
    createdAt: Date;
}