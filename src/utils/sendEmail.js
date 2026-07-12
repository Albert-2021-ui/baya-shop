import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import dns from 'dns/promises';
import { generateInvoicePDF } from './generateInvoicePDF';

const emailsFilePath = path.join(process.cwd(), 'src', 'data', 'sent_emails.json');

export async function sendConfirmationEmail(order) {
  try {
    if (!order) {
      throw new Error('Commande manquante pour l\'envoi d\'e-mail.');
    }

    const customerEmail = order.customer.email;
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
    const orderRef = order.payment.reference;
    
    // Formatter le prix pour l'email
    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price).replace('XOF', 'FCFA');
    };

    // 1. Générer le contenu HTML du courriel
    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const emailSubject = `Confirmation de commande BAYA SHOP - N° ${orderRef}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande - BAYA SHOP</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- En-tête -->
          <div style="background-color: #080b1a; padding: 30px; text-align: center; border-bottom: 3px solid #ff7a00;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">BAYA SHOP</h1>
            <p style="color: #ff7a00; margin: 5px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Confirmation de Commande</p>
          </div>
          
          <!-- Corps -->
          <div style="padding: 30px;">
            <h2 style="color: #080b1a; margin-top: 0;">Merci pour votre achat, ${customerName} !</h2>
            <p style="line-height: 1.6; color: #666666;">
              Nous avons le plaisir de vous confirmer la validation de votre commande. Votre transaction a été traitée avec succès. Vous trouverez ci-dessous le détail de votre quittance de paiement.
            </p>
            
            <!-- Détails de la Commande -->
            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #080b1a; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">Détails de la transaction</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Référence de commande :</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">${orderRef}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Date :</td>
                  <td style="padding: 5px 0; text-align: right;">${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Mode de Paiement :</td>
                  <td style="padding: 5px 0; text-align: right; text-transform: uppercase;">
                    ${order.payment.method === 'momo' 
                      ? `Mobile Money (${order.payment.provider})` 
                      : order.payment.method === 'direct_transfer'
                      ? `Transfert Direct MM (${order.payment.provider.replace('transfert_direct_', '')})`
                      : order.payment.method === 'bank_transfer'
                      ? 'Virement Bancaire Manuel'
                      : order.payment.method === 'external_gateway'
                      ? `Passerelle (${order.payment.provider})`
                      : 'Carte Bancaire'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Adresse de livraison :</td>
                  <td style="padding: 5px 0; text-align: right;">${order.customer.address}, ${order.customer.city}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Statut :</td>
                  <td style="padding: 5px 0; font-weight: bold; color: #10b981; text-align: right;">
                    ${order.status === 'pending_verification' ? 'À VÉRIFIER (TRANSFERT EN COURS)' : 'PAYÉ'}
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Tableau des articles -->
            <h3 style="color: #080b1a; margin-top: 0;">Articles commandés</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e9ecef;">Produit</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e9ecef;">Qté</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e9ecef;">Prix unitaire</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e9ecef;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            
            <!-- Totalités -->
            <div style="width: 250px; margin-left: auto; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #666666;">
                <span>Sous-total:</span>
                <span style="text-align: right;">${formatPrice(order.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #666666;">
                <span>Livraison:</span>
                <span style="text-align: right;">${order.shippingFee === 0 ? 'Gratuit' : formatPrice(order.shippingFee)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 16px; border-top: 1px solid #e9ecef; margin-top: 5px;">
                <span style="color: #080b1a;">Total :</span>
                <span style="color: #ff7a00; text-align: right;">${formatPrice(order.total)}</span>
              </div>
            </div>
            
            <!-- Note -->
            <p style="font-size: 12px; color: #999999; line-height: 1.5; margin-top: 40px; border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center;">
              Merci d'avoir commandé sur BAYA SHOP. Si vous avez des questions concernant cette facture, veuillez contacter notre service d'assistance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 1.5 Générer le PDF de la facture
    const pdfBuffer = await generateInvoicePDF(order);

    // 2. Tenter d'envoyer l'e-mail avec Nodemailer (si variables d'environnement définies)
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    let sentInfo = null;
    let emailStatus = 'logged_locally';

    if (hasSmtpConfig) {
      try {
        const hostName = process.env.SMTP_HOST || 'smtp.gmail.com';
        let resolvedHost = hostName;
        try {
          const lookupResult = await dns.lookup(hostName, { family: 4 });
          resolvedHost = lookupResult.address;
        } catch (err) {
          console.error(`Failed to resolve ${hostName} to IPv4:`, err);
        }

        const transportConfig = {
          host: resolvedHost,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          tls: {
            servername: hostName,
            rejectUnauthorized: false
          }
        };

        const transporter = nodemailer.createTransport(transportConfig);

        // Vérifier la connexion SMTP avant d'envoyer
        await transporter.verify();
        console.log('Connexion SMTP vérifiée avec succès.');

        sentInfo = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: customerEmail,
          subject: emailSubject,
          html: emailHtml,
          attachments: [
            {
              filename: `Facture_${orderRef}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        
        emailStatus = 'sent_via_smtp';
        console.log(`E-mail envoyé avec succès via SMTP à ${customerEmail}`);
      } catch (smtpError) {
        console.error('Échec de l\'envoi via SMTP, enregistrement en local...');
        console.error(`Code d'erreur SMTP: ${smtpError.responseCode || 'N/A'}`);
        console.error(`Message: ${smtpError.message}`);
        if (smtpError.responseCode === 535) {
          console.error('⚠️  SOLUTION: Votre mot de passe d\'application Gmail est invalide ou expiré.');
          console.error('   → Allez sur https://myaccount.google.com/apppasswords pour en générer un nouveau.');
          console.error('   → Mettez à jour SMTP_PASS dans .env.local avec le nouveau mot de passe.');
        }
      }
    }

    // 3. Fallback : Enregistrer le mail généré en local dans sent_emails.json
    let loggedEmails = [];
    try {
      const existingData = await fs.readFile(emailsFilePath, 'utf8');
      loggedEmails = JSON.parse(existingData);
    } catch (e) {
      // Si le fichier n'existe pas, on l'initialisera
      try {
        await fs.mkdir(path.dirname(emailsFilePath), { recursive: true });
      } catch(_) {}
      await fs.writeFile(emailsFilePath, JSON.stringify([], null, 2), 'utf8');
    }

    // Sauvegarder la facture PDF en local pour pouvoir la consulter plus tard
    try {
      const invoicesDir = path.join(process.cwd(), 'src', 'data', 'invoices');
      await fs.mkdir(invoicesDir, { recursive: true });
      await fs.writeFile(path.join(invoicesDir, `Facture_${orderRef}.pdf`), pdfBuffer);
    } catch(err) {
      console.error('Impossible de sauvegarder la facture en local', err);
    }

    const emailLogEntry = {
      id: loggedEmails.length + 1,
      to: customerEmail,
      subject: emailSubject,
      date: new Date().toISOString(),
      status: emailStatus,
      smtpInfo: sentInfo,
      htmlBody: emailHtml,
      hasAttachment: true,
      attachmentName: `Facture_${orderRef}.pdf`
    };

    try {
      loggedEmails.push(emailLogEntry);
      await fs.writeFile(emailsFilePath, JSON.stringify(loggedEmails, null, 2), 'utf8');
      console.log(`E-mail loggé localement dans : src/data/sent_emails.json`);
    } catch(err) {
      console.warn('Impossible de logger l\'e-mail localement (environnement en lecture seule ?)', err.message);
    }

    return {
      success: true,
      status: emailStatus,
      message: emailStatus === 'sent_via_smtp' ? 'E-mail envoyé.' : 'E-mail enregistré localement pour le test (SMTP non configuré).'
    };

  } catch (error) {
    console.error('Erreur dans l\'utilitaire d\'envoi d\'e-mail:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function sendContactEmail(formData) {
  try {
    if (!formData) {
      throw new Error('Données du formulaire de contact manquantes.');
    }

    const { name, email, phone, subject, message } = formData;
    const recipientEmail = process.env.SMTP_USER || 'eugenebaya6@gmail.com';
    const emailSubject = `Nouveau message de contact - ${subject} (${name})`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouveau message de contact - BAYA SHOP</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- En-tête -->
          <div style="background-color: #080b1a; padding: 30px; text-align: center; border-bottom: 3px solid #ff7a00;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">BAYA SHOP</h1>
            <p style="color: #ff7a00; margin: 5px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Message de Contact</p>
          </div>
          
          <!-- Corps -->
          <div style="padding: 30px;">
            <h2 style="color: #080b1a; margin-top: 0;">Nouveau message reçu !</h2>
            <p style="line-height: 1.6; color: #666666;">
              Vous avez reçu un nouveau message via le formulaire de contact de BAYA SHOP.
            </p>
            
            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #080b1a; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">Informations de l'expéditeur</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 5px 0; color: #666666; width: 120px;">Nom complet :</td>
                  <td style="padding: 5px 0; font-weight: bold;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Adresse Email :</td>
                  <td style="padding: 5px 0; font-weight: bold;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Téléphone :</td>
                  <td style="padding: 5px 0; font-weight: bold;">${phone || 'Non renseigné'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Sujet :</td>
                  <td style="padding: 5px 0; font-weight: bold;">${subject}</td>
                </tr>
              </table>
            </div>
            
            <h3 style="color: #080b1a; margin-top: 0;">Contenu du message</h3>
            <div style="background-color: #f8f9fa; border-left: 4px solid #ff7a00; padding: 15px; font-style: italic; white-space: pre-wrap; line-height: 1.5;">${message}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    let sentInfo = null;
    let emailStatus = 'logged_locally';

    if (hasSmtpConfig) {
      try {
        const hostName = process.env.SMTP_HOST || 'smtp.gmail.com';
        let resolvedHost = hostName;
        try {
          const lookupResult = await dns.lookup(hostName, { family: 4 });
          resolvedHost = lookupResult.address;
        } catch (err) {
          console.error(`Failed to resolve ${hostName} to IPv4:`, err);
        }

        const transportConfig = {
          host: resolvedHost,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          tls: {
            servername: hostName,
            rejectUnauthorized: false
          }
        };

        const transporter = nodemailer.createTransport(transportConfig);
        await transporter.verify();

        sentInfo = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: recipientEmail,
          replyTo: email,
          subject: emailSubject,
          html: emailHtml
        });
        emailStatus = 'sent_via_smtp';
        console.log(`E-mail de contact envoyé avec succès via SMTP à ${recipientEmail}`);
      } catch (smtpError) {
        console.error('Échec de l\'envoi via SMTP, enregistrement en local...');
        console.error(`Code d'erreur SMTP: ${smtpError.responseCode || 'N/A'}`);
        console.error(`Message: ${smtpError.message}`);
        if (smtpError.responseCode === 535) {
          console.error('⚠️  SOLUTION: Votre mot de passe d\'application Gmail est invalide ou expiré.');
          console.error('   → Allez sur https://myaccount.google.com/apppasswords pour en générer un nouveau.');
          console.error('   → Mettez à jour SMTP_PASS dans .env.local avec le nouveau mot de passe.');
        }
      }
    }

    // Sauvegarder localement
    let loggedEmails = [];
    try {
      const existingData = await fs.readFile(emailsFilePath, 'utf8');
      loggedEmails = JSON.parse(existingData);
    } catch (e) {
      try {
        await fs.mkdir(path.dirname(emailsFilePath), { recursive: true });
      } catch(_) {}
      await fs.writeFile(emailsFilePath, JSON.stringify([], null, 2), 'utf8');
    }

    const emailLogEntry = {
      id: loggedEmails.length + 1,
      to: recipientEmail,
      subject: emailSubject,
      date: new Date().toISOString(),
      status: emailStatus,
      smtpInfo: sentInfo,
      htmlBody: emailHtml
    };

    try {
      loggedEmails.push(emailLogEntry);
      await fs.writeFile(emailsFilePath, JSON.stringify(loggedEmails, null, 2), 'utf8');
    } catch(err) {
      console.warn('Impossible de logger le contact localement', err.message);
    }

    return {
      success: true,
      status: emailStatus,
      message: emailStatus === 'sent_via_smtp' ? 'E-mail envoyé.' : 'E-mail enregistré localement pour le test (SMTP non configuré).'
    };
  } catch (error) {
    console.error('Erreur dans l\'utilitaire d\'envoi d\'e-mail de contact:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
