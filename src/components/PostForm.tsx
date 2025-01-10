'use client'

import {useState} from 'react'

export default function PostForm({user, onPostCreated}: { user: any; onPostCreated: () => void; }) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    author: {
                        id: user.id,
                        username: user.username
                    }
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create post')
            }

            // Clear form after successful submission
            setTitle('')
            setContent('')

            // Refresh the posts list
            onPostCreated()

            alert('Post created successfully!')
        } catch (error) {
            console.error('Error creating post:', error)
            alert('Failed to create post')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
            >
                {isLoading ? 'Creating...' : 'Create Post'}
            </button>
        </form>
    )
}