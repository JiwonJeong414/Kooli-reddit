'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostList from '@/components/PostList'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, User, Users } from 'lucide-react'
import type { Drama } from '@/types'

interface UserProfile {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

// Custom scrollbar style
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(31, 41, 55);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(55, 65, 81);
    border-radius: 8px;
  }
`

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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <style>{customScrollbarStyle}</style>

            {/* Enhanced Header */}
            <div className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goBack}
                            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </button>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('user')
                                router.push('/login')
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Enhanced Profile Card */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        {user.username}
                                    </h1>
                                    <div className="flex items-center gap-4 text-gray-400 mt-1">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Member since {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Posts', value: stats.posts, icon: '📝' },
                        { label: 'Comments', value: stats.comments, icon: '💬' },
                        { label: 'Total Votes', value: stats.totalVotes, icon: '⭐️' }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="text-3xl font-bold text-white">{stat.value}</span>
                            </div>
                            <h3 className="text-gray-400">{stat.label}</h3>
                        </div>
                    ))}
                </div>

                {/* Enhanced Joined Communities */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">
                            Joined Communities
                        </h2>
                    </div>

                    {joinedDramas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {joinedDramas.map((drama) => (
                                <Link
                                    key={drama.slug}
                                    href={`/k/${drama.slug}`}
                                    className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors border border-gray-600"
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
                        <div className="text-center py-8 text-gray-400 bg-gray-700/20 rounded-xl border border-gray-700">
                            You haven't joined any communities yet
                        </div>
                    )}
                </div>

                {/* Enhanced Posts Section */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Your Posts</h2>
                    <div className="custom-scrollbar">
                        <PostList viewMode="my-posts" currentUser={user} refreshKey={0} />
                    </div>
                </div>
            </div>
        </div>
    )
}