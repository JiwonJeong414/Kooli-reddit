import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const post = await db.collection("posts").findOne({
            _id: new ObjectId(params.id)
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