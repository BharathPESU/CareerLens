import { NextResponse } from 'next/server';

const ARCHIVE_API_BASE = 'https://archive.org';
const ARCHIVE_SEARCH_API = `${ARCHIVE_API_BASE}/advancedsearch.php`;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const rows = searchParams.get('rows') || '20';

    if (!q) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const params = new URLSearchParams({
        q: q,
        fl: 'identifier,title,creator,year,description,downloads,language,subject,format',
        rows: rows,
        page: page,
        output: 'json',
        sort: 'downloads desc'
    });

    const url = `${ARCHIVE_SEARCH_API}?${params}`;
    console.log('Fetching from Internet Archive (Server):', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Archive API error: ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching from Internet Archive:', error);
        return NextResponse.json({ error: 'Failed to fetch from Internet Archive' }, { status: 500 });
    }
}
