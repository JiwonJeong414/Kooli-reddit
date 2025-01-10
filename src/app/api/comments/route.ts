import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const postId = request.nextUrl.searchParams.get('postId')
        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        const comments = await db.collection("comments")
            .find({ postId })
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json(comments)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const comment = {
            ...data,
            votes: 0,
            createdAt: new Date()
        }

        const result = await db.collection("comments").insertOne(comment)
        return NextResponse.json({
            _id: result.insertedId,
            ...comment
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        )
    }
}