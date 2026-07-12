import nodemailer from 'nodemailer';
import { loadEnvFile } from 'node:process';
loadEnvFile('.env.local');

async function test() {
  console.log('📧 Test de connexion SMTP Gmail...');
  console.log(`   Utilisateur: ${process.env.SMTP_USER}`);
  console.log(`   Mot de passe (4 premiers cars): ${process.env.SMTP_PASS?.substring(0, 4)}****`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP vérifiée avec succès !');

    // Envoyer un mail test
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // S'envoyer à soi-même
      subject: '✅ Test BAYA SHOP - SMTP fonctionne !',
      html: '<h2>Le SMTP fonctionne correctement !</h2><p>Ce mail test confirme que la configuration est bonne.</p>'
    });
    console.log('✅ Mail test envoyé avec succès !');
    console.log('   Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Erreur SMTP:', err.message);
    if (err.responseCode === 535) {
      console.error('');
      console.error('⚠️  Le mot de passe d\'application Gmail est INVALIDE ou EXPIRÉ.');
      console.error('');
      console.error('   ÉTAPES POUR CORRIGER :');
      console.error('   1. Allez sur https://myaccount.google.com/apppasswords');
      console.error('   2. Connectez-vous avec eugenebaya6@gmail.com');
      console.error('   3. Créez un nouveau mot de passe d\'application (nom: "BAYA SHOP")');
      console.error('   4. Copiez le mot de passe de 16 caractères généré');
      console.error('   5. Remplacez SMTP_PASS dans .env.local par ce nouveau mot de passe');
      console.error('   6. Relancez ce test : node test-smtp.mjs');
      console.error('');
      console.error('   ⚠️  IMPORTANT: La vérification en 2 étapes doit être activée sur le compte Gmail.');
    }
  }
}

test();
