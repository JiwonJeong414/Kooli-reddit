import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        // Get post count
        const postCount = await db.collection("posts")
            .countDocuments({ "author.id": userId })

        // Get comment count
        const commentCount = await db.collection("comments")
            .countDocuments({ "author.id": userId })

        // Get total votes received on posts
        const posts = await db.collection("posts")
            .find({ "author.id": userId })
            .toArray()

        const totalVotes = posts.reduce((acc, post) => acc + (post.votes || 0), 0)

        return NextResponse.json({
            posts: postCount,
            comments: commentCount,
            totalVotes: totalVotes
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        )
    }
}