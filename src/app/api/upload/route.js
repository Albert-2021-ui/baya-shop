import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier uploadé.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueName = Date.now() + '-' + file.name.replace(/\s/g, '_');
    const filepath = path.join(process.cwd(), 'public/uploads', uniqueName);

    await writeFile(filepath, buffer);
    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'upload du fichier.' }, { status: 500 });
  }
}
