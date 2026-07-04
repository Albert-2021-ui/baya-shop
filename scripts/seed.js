const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Début de la migration des données...');
  
  const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(data);
    
    console.log(`${products.length} produits trouvés dans le JSON.`);
    
    // Clear existing products (optional, for clean slate)
    await prisma.product.deleteMany({});
    
    for (const p of products) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          category: p.category,
          image: p.image,
          rating: parseFloat(p.rating || 5.0),
          stock: parseInt(p.stock || 10)
        }
      });
      console.log(`Produit importé: ${p.name}`);
    }
    console.log('Migration terminée avec succès !');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Fichier products.json introuvable. Aucune donnée à migrer.');
    } else {
      console.error('Erreur lors de la migration:', error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
