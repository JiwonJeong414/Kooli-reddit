import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        // Extract the slug from the request URL
        const slug = request.nextUrl.pathname.split('/').slice(-2)[0]; // Adjust based on the route structure

        const client = await clientPromise;
        const db = client.db("reddit-clone");

        const drama = await db.collection("dramas").findOne({ slug });

        if (!drama) {
            return NextResponse.json(
                { error: 'Drama not found' },
                { status: 404 }
            );
        }

        const posts = await db.collection("posts")
            .find({ dramaSlug: slug })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({
            ...drama,
            posts,
        });
    } catch (error) {
        console.error('Error fetching drama:', error);
        return NextResponse.json(
            { error: 'Failed to fetch drama' },
            { status: 500 }
        );
    }
}
