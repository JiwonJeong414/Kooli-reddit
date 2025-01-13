'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostList from '@/components/PostList'
import Link from 'next/link'
import type { Drama } from '@/types'

interface UserProfile {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

export default function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ posts: 0, comments: 0, totalVotes: 0 })
    const [joinedDramas, setJoinedDramas] = useState<Drama[]>([])
    const router = useRouter()

    const goBack = () => {
        router.back()
    }

    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }
        setUser(JSON.parse(userData))
        setLoading(false)
    }, [router])

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return

            try {
                // Fetch stats and joined dramas in parallel
                const [statsRes, dramasRes] = await Promise.all([
                    fetch(`/api/users/stats?userId=${user.id}`),
                    fetch(`/api/users/dramas?userId=${user.id}`)
                ])

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
                }

                if (dramasRes.ok) {
                    const dramasData = await dramasRes.json()
                    setJoinedDramas(dramasData)
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchData()
    }, [user?.id])

    if (loading || !user) return null

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={goBack}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center"
                >
                    <span className="mr-2">←</span> Back
                </button>

                {/* Profile Card */}
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{user.username}</h1>
                            <p className="text-gray-400">{user.email}</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Member since {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('user')
                                router.push('/login')
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-900 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm">Posts</h3>
                        <p className="text-2xl font-bold text-white">{stats.posts}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm">Comments</h3>
                        <p className="text-2xl font-bold text-white">{stats.comments}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm">Total Votes</h3>
                        <p className="text-2xl font-bold text-white">{stats.totalVotes}</p>
                    </div>
                </div>

                {/* Joined Communities */}
                <div className="bg-gray-900 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Joined Communities</h2>
                    {joinedDramas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {joinedDramas.map((drama) => (
                                <Link
                                    key={drama.slug}
                                    href={`/k/${drama.slug}`}
                                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    {drama.imageUrl && (
                                        <img
                                            src={drama.imageUrl}
                                            alt={drama.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-white font-medium">k/{drama.title}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {drama.memberCount?.toLocaleString() || 0} members
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            You haven't joined any communities yet
                        </div>
                    )}
                </div>

                {/* User's Posts */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Your Posts</h2>
                    <PostList viewMode="my-posts" currentUser={user} refreshKey={0} />
                </div>
            </div>
        </div>
    )
}