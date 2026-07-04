import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadsDir, uniqueName);

    // Créer le dossier uploads s'il n'existe pas (important pour production)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    await writeFile(filepath, buffer);
    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors de l'upload du fichier. Si vous êtes en production, utilisez une URL d'image externe." 
    }, { status: 500 });
  }
}
