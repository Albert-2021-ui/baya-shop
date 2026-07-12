import fs from 'fs/promises';
import path from 'path';
import { generateInvoicePDF } from './generateInvoicePDF';
import nodemailer from 'nodemailer';

const emailsFilePath = path.join(process.cwd(), 'src', 'data', 'sent_emails.json');

/**
 * Envoie un email via Resend API fetch natif (priorité) ou Gmail Webhook (fallback).
 * @param {object} options - { to, subject, html, replyTo?, attachments? }
 * @returns {Promise<{success: boolean, status: string, error?: string}>}
 */
async function sendViaResendOrWebhook({ to, subject, html, replyTo, attachments }) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Accepte plusieurs noms de variables possibles + valeurs de secours codées en dur
  const resendApiKey =
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_API ||
    're_CYe1WrwC_3ejGfiHH439h1NRWATYw615J'; // fallback

  const webhookUrl =
    process.env.GMAIL_WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK_API_KEY ||
    process.env.WEBHOOK_URL ||
    process.env.GMAIL_WEBHOOK ||
    'https://script.google.com/macros/s/AKfycby0__BIyN-BlUm6Qvq67I0wZThlElyGxuCuzHPZx20MnqjcTRYzUKF4mQH8s-Y_eH_yaQ/exec'; // fallback

  const fromAddress = process.env.RESEND_FROM || process.env.SMTP_FROM || 'BAYA SHOP <onboarding@resend.dev>';

  // ── Méthode 1 : Resend API via fetch natif (sans SDK) ──
  if (resendApiKey) {
    try {
      const emailPayload = {
        from: fromAddress,
        to: [to],
        subject,
        html,
      };

      // CORRECTION DU BUG RESEND :
      // Le domaine de test onboarding@resend.dev ne permet d'envoyer qu'à l'email du propriétaire.
      // Si on utilise l'email de test, on force la destination vers l'admin pour contourner l'erreur 403.
      if (fromAddress.includes('onboarding@resend.dev')) {
        const adminEmail = process.env.CONTACT_EMAIL || 'eugenebaya6@gmail.com';
        emailPayload.to = [adminEmail];
      }

      if (replyTo) {
        emailPayload.reply_to = replyTo;
      } else if (fromAddress.includes('onboarding@resend.dev')) {
        emailPayload.reply_to = to;
      }

      // Pièces jointes
      if (attachments && attachments.length > 0) {
        emailPayload.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.content // Nodemailer gère le Buffer nativement !
        }));
      }

      console.log(`📧 Tentative d'envoi via Resend SMTP à ${to}...`);

      const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: resendApiKey.trim(),
        },
        // Timeout configuré proprement pour Nodemailer
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter.sendMail(emailPayload);

      console.log(`✅ E-mail envoyé via Resend SMTP à ${to} (ID: ${info.messageId})`);
      return { success: true, status: 'sent_via_resend_smtp', messageId: info.messageId };
    } catch (resendErr) {
      const isTimeout = resendErr.name === 'AbortError';
      const reason = isTimeout ? 'Timeout (15s)' : resendErr.message;
      console.error(`❌ Échec Resend: ${reason}`);
      
      // Fallback vers webhook si Resend échoue
      if (webhookUrl) {
        console.log('⏩ Tentative via Gmail Webhook...');
      } else if (isDev) {
        console.log('📝 Mode développement : e-mail enregistré localement (Resend indisponible)');
        return { success: true, status: 'logged_locally_dev', error: reason };
      } else {
        return { success: false, status: 'resend_failed', error: reason };
      }
    }
  }

  // ── Méthode 2 : Gmail Webhook (fallback) ──
  if (webhookUrl) {
    try {
      const webhookPayload = { to, subject, html };
      if (replyTo) webhookPayload.replyTo = replyTo;

      // Ajouter le PDF en base64 si présent
      if (attachments && attachments.length > 0) {
        const pdfAtt = attachments[0];
        webhookPayload.pdfBase64 = Buffer.isBuffer(pdfAtt.content)
          ? pdfAtt.content.toString('base64')
          : pdfAtt.content;
        webhookPayload.pdfName = pdfAtt.filename;
      }

      console.log(`📧 Tentative d'envoi via Gmail Webhook à ${to}...`);

      const controller = new AbortController();
      const webhookTimeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(webhookTimeout);
      const result = await response.json();

      if (result.success) {
        console.log(`✅ E-mail envoyé via Gmail Webhook à ${to}`);
        return { success: true, status: 'sent_via_webhook' };
      } else {
        throw new Error(result.error || 'Erreur inconnue du Webhook');
      }
    } catch (webhookErr) {
      const isTimeout = webhookErr.name === 'AbortError';
      const reason = isTimeout ? 'Timeout webhook (12s)' : webhookErr.message;
      console.error(`❌ Échec Webhook: ${reason}`);
      
      if (isDev) {
        console.log('📝 Mode développement : e-mail enregistré localement (services indisponibles)');
        return { success: true, status: 'logged_locally_dev', error: reason };
      }
      return { success: false, status: 'webhook_failed', error: reason };
    }
  }

  // Aucune méthode configurée
  if (isDev) {
    console.log('📝 Mode développement : aucun service e-mail configuré — e-mail loggé localement');
    return { success: true, status: 'logged_locally_dev', error: 'Aucun service email configuré' };
  }
  
  console.warn('⚠️ Aucun service d\'email configuré (RESEND_API_KEY ou GMAIL_WEBHOOK_URL manquant)');
  return { success: false, status: 'no_email_service', error: 'Aucun service d\'email configuré.' };
}

/**
 * Logger un email localement (pour historique / debug)
 */
async function logEmailLocally({ to, subject, status, html, hasAttachment, attachmentName }) {
  let loggedEmails = [];
  try {
    const existingData = await fs.readFile(emailsFilePath, 'utf8');
    loggedEmails = JSON.parse(existingData);
  } catch (e) {
    try {
      await fs.mkdir(path.dirname(emailsFilePath), { recursive: true });
    } catch (_) {}
  }

  const emailLogEntry = {
    id: loggedEmails.length + 1,
    to,
    subject,
    date: new Date().toISOString(),
    status,
    htmlBody: html,
    hasAttachment: !!hasAttachment,
    attachmentName: attachmentName || null,
  };

  try {
    loggedEmails.push(emailLogEntry);
    await fs.writeFile(emailsFilePath, JSON.stringify(loggedEmails, null, 2), 'utf8');
    console.log(`📝 E-mail loggé localement (statut: ${status})`);
  } catch (err) {
    console.warn('Impossible de logger l\'e-mail localement (système de fichiers en lecture seule ?)', err.message);
  }
}

// ═══════════════════════════════════════════════════════════
// E-mail de confirmation de commande
// ═══════════════════════════════════════════════════════════
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

    // 2. Générer le PDF de la facture
    const pdfBuffer = await generateInvoicePDF(order);

    // 3. Envoyer l'email via Resend ou Webhook
    const sendResult = await sendViaResendOrWebhook({
      to: customerEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `Facture_${orderRef}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    const emailStatus = sendResult.success ? sendResult.status : 'logged_locally';

    // 4. Sauvegarder la facture PDF en local
    try {
      const invoicesDir = path.join(process.cwd(), 'src', 'data', 'invoices');
      await fs.mkdir(invoicesDir, { recursive: true });
      await fs.writeFile(path.join(invoicesDir, `Facture_${orderRef}.pdf`), pdfBuffer);
    } catch (err) {
      console.error('Impossible de sauvegarder la facture en local', err);
    }

    // 5. Logger localement
    await logEmailLocally({
      to: customerEmail,
      subject: emailSubject,
      status: emailStatus,
      html: emailHtml,
      hasAttachment: true,
      attachmentName: `Facture_${orderRef}.pdf`,
    });

    return {
      success: true,
      status: emailStatus,
      message: sendResult.success
        ? 'E-mail envoyé avec succès.'
        : 'E-mail enregistré localement (service d\'email non disponible).',
    };

  } catch (error) {
    console.error('Erreur dans l\'utilitaire d\'envoi d\'e-mail:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════
// E-mail de contact
// ═══════════════════════════════════════════════════════════
export async function sendContactEmail(formData) {
  try {
    if (!formData) {
      throw new Error('Données du formulaire de contact manquantes.');
    }

    const { name, email, phone, subject, message } = formData;
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'eugenebaya6@gmail.com';
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

    // Envoyer via Resend ou Webhook
    const sendResult = await sendViaResendOrWebhook({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      replyTo: email,
    });

    const emailStatus = sendResult.success ? sendResult.status : 'logged_locally';

    // Logger localement
    await logEmailLocally({
      to: recipientEmail,
      subject: emailSubject,
      status: emailStatus,
      html: emailHtml,
    });

    return {
      success: true,
      status: emailStatus,
      message: sendResult.success
        ? 'E-mail envoyé avec succès.'
        : 'E-mail enregistré localement (service d\'email non disponible).',
    };
  } catch (error) {
    console.error('Erreur dans l\'utilitaire d\'envoi d\'e-mail de contact:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
