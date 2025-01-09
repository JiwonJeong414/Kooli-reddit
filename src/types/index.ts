export interface User {
    _id: string;
    username: string;
    email: string;
    createdAt: Date;
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
    author: User;
    post: string;
    parentComment?: string;
    votes: number;
    createdAt: Date;
}