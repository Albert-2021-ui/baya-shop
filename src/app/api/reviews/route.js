import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reviews - Récupérer tous les avis (triés du plus récent au plus ancien)
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Erreur lors de la lecture des avis:', error);
    return NextResponse.json({ error: 'Impossible de charger les avis.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/reviews - Ajouter un nouvel avis
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validation de base
    if (!data.authorName || !data.comment) {
      return NextResponse.json({ error: 'Nom et commentaire requis.' }, { status: 400 });
    }

    const rating = parseInt(data.rating) || 5;

    const newReview = await prisma.review.create({
      data: {
        authorName: data.authorName,
        rating: rating >= 1 && rating <= 5 ? rating : 5,
        comment: data.comment
      }
    });
    
    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    return NextResponse.json({ error: 'Impossible d\'ajouter l\'avis.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
