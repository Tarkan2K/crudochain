import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads/games');
        await mkdir(uploadDir, { recursive: true });

        // Create a unique folder name
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase().replace('.zip', '');
        const folderName = `${timestamp}-${safeName}`;
        const folderPath = path.join(uploadDir, folderName);

        // 1. Save the zip file (optional, but good for backup)
        const zipPath = path.join(uploadDir, `${folderName}.zip`);
        await writeFile(zipPath, buffer);

        // 2. Unzip contents
        const zip = new AdmZip(buffer);
        zip.extractAllTo(folderPath, true);

        // 3. Return the public URL to index.html
        // We assume the game has index.html at root. If not, we might need to search for it.
        const publicUrl = `/uploads/games/${folderName}/index.html`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            message: 'File uploaded and extracted successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
