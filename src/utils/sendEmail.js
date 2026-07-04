import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { generateInvoicePDF } from './generateInvoicePDF.js';

const emailsFilePath = path.join(process.cwd(), 'src', 'data', 'sent_emails.json');

export async function sendConfirmationEmail(order) {
  try {
    if (!order) {
      throw new Error('Commande manquante pour l\'envoi d\'e-mail.');
    }

    const customerEmail = order?.customer?.email;
    const customerName = `${order?.customer?.firstName} ${order?.customer?.lastName}`;
    const orderRef = order?.payment?.reference;
    
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
    const itemsRows = order?.items?.map(item => `
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
                    ${order?.payment?.method === 'momo' 
                      ? `Mobile Money (${order?.payment?.provider})` 
                      : order?.payment?.method === 'direct_transfer'
                      ? `Transfert Direct MM (${order?.payment?.provider.replace('transfert_direct_', '')})`
                      : order?.payment?.method === 'external_gateway'
                      ? `Passerelle (${order?.payment?.provider})`
                      : 'Carte Bancaire'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Adresse de livraison :</td>
                  <td style="padding: 5px 0; text-align: right;">${order?.customer?.address}, ${order?.customer?.city}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #666666;">Statut :</td>
                  <td style="padding: 5px 0; font-weight: bold; color: #10b981; text-align: right;">
                    ${order?.status === 'pending_verification' ? 'À VÉRIFIER (TRANSFERT EN COURS)' : 'PAYÉ'}
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
                <span style="text-align: right;">${formatPrice(order?.subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #666666;">
                <span>Livraison:</span>
                <span style="text-align: right;">${order?.shippingFee === 0 ? 'Gratuit' : formatPrice(order?.shippingFee)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 16px; border-top: 1px solid #e9ecef; margin-top: 5px;">
                <span style="color: #080b1a;">Total :</span>
                <span style="color: #ff7a00; text-align: right;">${formatPrice(order?.total)}</span>
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

    // 2. Générer le PDF de la quittance côté serveur
    let pdfBuffer = null;
    let pdfError = null;
    try {
      pdfBuffer = await generateInvoicePDF(order);
      if (pdfBuffer) {
        console.log(`PDF de quittance généré (${pdfBuffer.length} octets)`);
      }
    } catch (pdfErr) {
      pdfError = pdfErr.message || String(pdfErr);
      console.error('Erreur lors de la génération du PDF de quittance:', pdfErr);
    }

    // 3. Tenter d'envoyer l'e-mail avec Nodemailer (si variables d'environnement définies)
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    let sentInfo = null;
    let emailStatus = 'logged_locally';

    if (hasSmtpConfig) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        console.log(`Envoi de l'email de confirmation à ${customerEmail}...`);
        let fromHeader = process.env.SMTP_FROM || process.env.SMTP_USER || '"BAYA SHOP" <eugenebaya6@gmail.com>';
        // Nettoyer les backslashes d'échappement potentiels si l'env les a inclus littéralement
        fromHeader = fromHeader.replace(/\\"/g, '"');

        const mailOptions = {
          from: fromHeader,
          to: customerEmail,
          subject: emailSubject,
          html: emailHtml,
        };

        // Attacher le PDF si la génération a réussi
        if (pdfBuffer) {
          mailOptions.attachments = [
            {
              filename: `Facture_${orderRef}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }
          ];
        }

        sentInfo = await transporter.sendMail(mailOptions);
        
        emailStatus = 'sent_via_smtp';
        console.log(`E-mail envoyé avec succès via SMTP à ${customerEmail}`);
      } catch (smtpError) {
        console.error('Échec de l\'envoi via SMTP, enregistrement en local...', smtpError);
      }
    }

    // 4. Fallback : Enregistrer le mail généré en local dans sent_emails.json
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

    const emailLogEntry = {
      id: loggedEmails.length + 1,
      to: customerEmail,
      subject: emailSubject,
      date: new Date().toISOString(),
      status: emailStatus,
      smtpInfo: sentInfo,
      pdfAttached: !!pdfBuffer,
      pdfSize: pdfBuffer ? pdfBuffer.length : 0,
      pdfError: pdfError,
      htmlBody: emailHtml
    };

    loggedEmails.push(emailLogEntry);
    await fs.writeFile(emailsFilePath, JSON.stringify(loggedEmails, null, 2), 'utf8');
    console.log(`E-mail loggé localement dans : src/data/sent_emails.json`);

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
    const { name, email, phone, subject, message } = formData;
    const emailSubject = `Nouveau message de contact : ${subject}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #080b1a; border-bottom: 2px solid #ff7a00; padding-bottom: 10px;">Nouveau Message de Contact</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    let emailStatus = 'logged_locally';

    if (hasSmtpConfig) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        let fromHeader = process.env.SMTP_FROM || process.env.SMTP_USER || '"BAYA SHOP" <eugenebaya6@gmail.com>';
        fromHeader = fromHeader.replace(/\\"/g, '"');

        await transporter.sendMail({
          from: fromHeader,
          to: 'eugenebaya6@gmail.com', // Destination fixe
          replyTo: email, // L'adresse du client
          subject: emailSubject,
          html: emailHtml,
        });
        
        emailStatus = 'sent_via_smtp';
        console.log(`E-mail de contact envoyé via SMTP à eugenebaya6@gmail.com`);
      } catch (smtpError) {
        console.error('Échec de l\'envoi via SMTP, enregistrement en local...', smtpError);
      }
    }

    // Logging local
    let loggedEmails = [];
    try {
      const existingData = await fs.readFile(emailsFilePath, 'utf8');
      loggedEmails = JSON.parse(existingData);
    } catch (e) {
      try { await fs.mkdir(path.dirname(emailsFilePath), { recursive: true }); } catch(_) {}
      await fs.writeFile(emailsFilePath, JSON.stringify([], null, 2), 'utf8');
    }

    loggedEmails.push({
      id: loggedEmails.length + 1,
      to: 'eugenebaya6@gmail.com',
      subject: emailSubject,
      date: new Date().toISOString(),
      status: emailStatus,
      htmlBody: emailHtml,
      type: 'contact_form'
    });
    await fs.writeFile(emailsFilePath, JSON.stringify(loggedEmails, null, 2), 'utf8');

    return { success: true, status: emailStatus };
  } catch (error) {
    console.error('Erreur sendContactEmail:', error);
    return { success: false, error: error.message };
  }
}
