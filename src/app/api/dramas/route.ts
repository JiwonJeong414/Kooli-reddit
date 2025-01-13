import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { Drama } from '@/types'

// Define a type for MongoDB Drama document
interface DramaDocument {
    _id?: ObjectId;
    title: string;
    slug: string;
    imageUrl: string;
    link: string;
    memberCount: number;
    createdAt: Date;
}

function createSlug(title: string): string {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")

        // First try to get dramas from MongoDB
        const cachedDramas = await db.collection("dramas")
            .find({})
            .sort({ memberCount: -1 })
            .toArray()

        if (cachedDramas.length > 0) {
            // Convert MongoDB documents to Drama type
            const dramas: { [p: string]: any; _id: string }[] = cachedDramas.map(drama => ({
                ...drama,
                _id: drama._id.toString()
            }))
            return NextResponse.json(dramas)
        }

        // If no cached dramas, scrape and store them
        const response = await fetch('https://www.ondemandkorea.com/category/drama')
        const html = await response.text()
        const $ = cheerio.load(html)

        // Create array of DramaDocument for MongoDB
        const dramaDocuments: DramaDocument[] = []

        $('.ThumbnailLink').each((_, element) => {
            const link = $(element).find('a').attr('href') || ''
            const title = link.split('/').pop()?.replace(/-/g, ' ') || ''
            const imageUrl = $(element).find('.Thumbnail img').attr('src') || ''
            const slug = createSlug(title)

            dramaDocuments.push({
                title,
                slug,
                imageUrl,
                link,
                memberCount: Math.floor(Math.random() * 10000),
                createdAt: new Date()
            })
        })

        // Store dramas in MongoDB
        if (dramaDocuments.length > 0) {
            await db.collection("dramas").insertMany(dramaDocuments)
        }

        // Convert to Drama type for response
        const dramas: Drama[] = dramaDocuments.map(drama => ({
            ...drama,
            _id: drama._id?.toString()
        }))

        return NextResponse.json(dramas)
    } catch (error) {
        console.error('Scraping failed:', error)
        return NextResponse.json(
            { error: 'Failed to scrape dramas' },
            { status: 500 }
        )
    }
}