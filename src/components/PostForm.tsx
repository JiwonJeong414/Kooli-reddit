'use client'

import { useState } from 'react'

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
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

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
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            })

            if (!response.ok) {
                throw new Error('Failed to create post')
            }

            setTitle('')
            setContent('')
            onPostCreated() // This will trigger the refresh
        } catch (error) {
            console.error('Error creating post:', error)
            alert('Failed to create post')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-900 p-6 rounded-lg">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                />
            </div>
            {dramaTitle && (
                <div className="text-sm text-gray-400">
                    Posting in: k/{dramaTitle}
                </div>
            )}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Creating...' : 'Create Post'}
            </button>
        </form>
    )
}