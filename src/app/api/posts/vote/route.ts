import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface VoteRequest {
    postId: string
    userId: string
    vote: number | null
}

interface Voter {
    userId: string
    vote: number
}

export async function POST(request: NextRequest) {
    try {
        const { postId, userId, vote } = await request.json() as VoteRequest
        const client = await clientPromise
        const db = client.db("reddit-clone")
        const postsCollection = db.collection("posts")

        // Check if post exists
        const post = await postsCollection.findOne({
            _id: new ObjectId(postId)
        })

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            )
        }

        // First remove any existing vote
        await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            {
                $pull: {
                    voters: { userId }
                } as unknown as any
            }
        )

        // Add new vote if it's not null
        if (vote !== null) {
            await postsCollection.updateOne(
                { _id: new ObjectId(postId) },
                {
                    $push: {
                        voters: {
                            userId,
                            vote
                        }
                    } as unknown as any
                }
            )
        }

        // Get the updated document to calculate total votes
        const updatedPost = await postsCollection.findOne({
            _id: new ObjectId(postId)
        })

        const totalVotes = (updatedPost?.voters || []).reduce(
            (acc: number, curr: Voter) => acc + curr.vote,
            0
        )

        // Update total votes count
        await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $set: { votes: totalVotes } }
        )

        return NextResponse.json({ success: true, votes: totalVotes })
    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json(
            { error: 'Failed to vote' },
            { status: 500 }
        )
    }
}