import { NextResponse } from 'next/server';

const ARCHIVE_API_BASE = 'https://archive.org';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
        return NextResponse.json({ error: 'Identifier parameter is required' }, { status: 400 });
    }

    const url = `${ARCHIVE_API_BASE}/metadata/${identifier}`;
    console.log('Fetching metadata from Internet Archive (Server):', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Archive API error: ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching metadata from Internet Archive:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata from Internet Archive' }, { status: 500 });
    }
}
