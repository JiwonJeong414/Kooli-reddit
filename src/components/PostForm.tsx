'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react';


export default function PostForm({
                                     user,
                                     dramaId,
                                     dramaSlug,
                                     dramaTitle,
                                     onPostCreated
                                 }: {
    user: any;
    dramaId?: string;
    dramaSlug?: string;
    dramaTitle?: string;
    onPostCreated: () => void;
}) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleContentChange = (e: { target: { value: any; }; }) => {
        const text = e.target.value;
        setContent(text);
        setCharCount(text.length);
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const postData = {
                title,
                content,
                author: {
                    id: user.id,
                    username: user.username
                },
                dramaId,
                dramaSlug,
                dramaTitle,
                createdAt: new Date()
            };

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            setTitle('');
            setContent('');
            setCharCount(0);
            onPostCreated();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="relative space-y-4 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800/50">
                {dramaTitle && (
                    <div className="text-sm text-gray-400 mb-4 pb-4 border-b border-gray-800/50">
                        Creating a post in <span className="text-blue-400 font-medium">k/{dramaTitle}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                                transition-all duration-200"
                            placeholder="Enter your post title"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                            Content
                        </label>
                        <div className="relative">
                            <textarea
                                id="content"
                                value={content}
                                onChange={handleContentChange}
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500
                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                                    transition-all duration-200 resize-none"
                                placeholder="What's on your mind?"
                                required
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                {charCount} characters
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg
                            hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                            transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating Post...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Create Post
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-3">
                        <Loader2 size={24} className="animate-spin text-blue-400" />
                        <span className="text-gray-200">Creating your post...</span>
                    </div>
                </div>
            )}
        </form>
    );
}