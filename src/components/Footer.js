'use client';

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="ft">
      {/* Grille : Brand | Contact */}
      <div className="ft-main">
        <div className="container">
          <div className="ft-grid-simple">
            {/* Brand + Réseaux sociaux */}
            <div className="ft-col">
              <div className="ft-logo">BAYA <span>SHOP</span></div>
              <p className="ft-brand-desc">
                {t.footerDesc || 'Votre boutique premium au Bénin & en Afrique de l\'Ouest. Paiement 100 % sécurisé et livraison express à votre porte.'}
              </p>
              <div className="ft-socials">
                <a href="#" className="ft-social-btn" aria-label="Facebook" title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="#" className="ft-social-btn" aria-label="WhatsApp" title="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M11.997 0C5.372 0 0 5.372 0 11.997c0 2.115.554 4.099 1.522 5.823L0 24l6.335-1.498A11.933 11.933 0 0011.997 24C18.622 24 24 18.628 24 11.997 24 5.372 18.622 0 11.997 0zm0 21.818a9.81 9.81 0 01-4.995-1.365l-.36-.213-3.72.879.917-3.618-.237-.373A9.804 9.804 0 012.182 12c0-5.418 4.397-9.818 9.818-9.818 5.417 0 9.818 4.4 9.818 9.818 0 5.417-4.401 9.818-9.821 9.818z"/></svg>
                </a>
                <a href="#" className="ft-social-btn" aria-label="Instagram" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="ft-social-btn" aria-label="TikTok" title="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.98a8.19 8.19 0 004.79 1.52V7.04a4.85 4.85 0 01-1.02-.35z"/></svg>
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="ft-col">
              <h4 className="ft-col-title">{t.contact || 'Contact'}</h4>
              <div className="ft-contact-items">
                <div className="ft-contact-item">
                  <span className="ft-contact-icon">📍</span>
                  <span>Djougou, Bénin</span>
                </div>
                <div className="ft-contact-item">
                  <span className="ft-contact-icon">📧</span>
                  <a href="mailto:contact@bayashop.com" className="ft-link">contact@bayashop.com</a>
                </div>
                <div className="ft-contact-item">
                  <span className="ft-contact-icon">📱</span>
                  <a href="tel:+22997000000" className="ft-link">+229 97 00 00 00</a>
                </div>
                <div className="ft-contact-item">
                  <span className="ft-contact-icon">⏰</span>
                  <span>{t.businessHours || 'Lun – Sam : 8h – 20h'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modes de paiement */}
      <div className="ft-payments">
        <div className="container">
          <div className="ft-pay-inner">
            <span className="ft-pay-label">{t.paymentsAccepted || 'Paiements acceptés :'}</span>
            <div className="ft-pay-tags">
              <span className="ft-pay-tag ft-pay-fedapay">FedaPay</span>
              <span className="ft-pay-tag ft-pay-cinetpay">CinetPay</span>
              <span className="ft-pay-tag ft-pay-momo">📱 MTN Money</span>
              <span className="ft-pay-tag ft-pay-moov">📱 Moov Money</span>
              <span className="ft-pay-tag ft-pay-transfer">{t.transferPayTag || '💸 Virement Direct'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="ft-bottom">
        <div className="container">
          <div className="ft-bottom-inner">
            <span>© {new Date().getFullYear()} <strong>BAYA SHOP</strong> — {t.allRightsReserved || 'Tous droits réservés.'}</span>
            <span className="ft-bottom-credit">{t.designedBy || 'Conçu avec ❤️ par Albert BAYA · Bénin 🇧🇯'}</span>
            <div className="ft-bottom-links">
              <a href="#" className="ft-bottom-link">{t.privacy || 'Confidentialité'}</a>
              <span className="ft-bottom-sep">·</span>
              <a href="#" className="ft-bottom-link">{t.terms || 'CGU'}</a>
              <span className="ft-bottom-sep">·</span>
              <a href="#" className="ft-bottom-link">{t.cookies || 'Cookies'}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
