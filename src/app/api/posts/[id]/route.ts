import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop()
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(id)
        })

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop()
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const result = await db.collection("posts").deleteOne({
            _id: new ObjectId(id)
        })

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop()
        const data = await request.json()
        const { title, content } = data

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        const result = await db.collection("posts").updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                    title,
                    content,
                    editedAt: new Date()
                }}
        )

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic'