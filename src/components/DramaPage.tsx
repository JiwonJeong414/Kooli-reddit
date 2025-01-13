'use client'

import { useEffect, useState } from 'react'
import PostList from '@/components/PostList'
import PostForm from '@/components/PostForm'
import { Drama } from '@/types'

export default function DramaPage({ params }: { params: { slug: string } }) {
    const [drama, setDrama] = useState<Drama | null>(null)
    const [user, setUser] = useState<any>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        // Load user from session storage
        const userData = sessionStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch drama and its posts
        const fetchDrama = async () => {
            try {
                const response = await fetch(`/api/dramas/${params.slug}`)
                const data = await response.json()
                setDrama(data.drama)
            } catch (error) {
                console.error('Error fetching drama:', error)
            }
        }

        fetchDrama()
    }, [params.slug])

    if (!drama) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Drama Header */}
                <div className="bg-gray-900 p-6 rounded-lg shadow mb-8">
                    <div className="flex items-center space-x-4">
                        <img
                            src={drama.imageUrl}
                            alt={drama.title}
                            className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-white">{drama.title}</h1>
                            <p className="text-gray-400">
                                {drama.memberCount?.toLocaleString()} members
                            </p>
                        </div>
                    </div>
                </div>

                {/* Post Form */}
                {user && (
                    <PostForm
                        user={user}
                        dramaId={drama._id}
                        dramaSlug={drama.slug}
                        dramaTitle={drama.title}
                        onPostCreated={() => setRefreshKey(k => k + 1)}
                    />
                )}

                {/* Posts */}
                {user ? (
                    <PostList
                        viewMode="all"
                        currentUser={user}
                        refreshKey={refreshKey}
                        dramaSlug={drama.slug}
                    />
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        Please login to view and interact with posts
                    </div>
                )}
            </div>
        </div>
    )
}