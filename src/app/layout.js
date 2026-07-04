import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AppProvider } from "../context/AppContext";
import { WishlistProvider } from "../context/WishlistContext";
import Header from "../components/Header";
import ClientSidebarWrapper from "../components/ClientSidebarWrapper";
import NewsletterForm from "../components/NewsletterForm";

export const metadata = {
  title: "BAYA SHOP - Expérience E-Commerce Ultime",
  description: "Plateforme e-commerce haut de gamme créée par Albert BAYA. Paiement Mobile Money & Virement sécurisés.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              <ClientSidebarWrapper />
              <main style={{ minHeight: "calc(100vh - 80px)" }}>
                {children}
              </main>
              
              {/* ── MEGA FOOTER ─────────────────────────────────────────── */}
              <footer style={{ 
                background: '#020617', 
                borderTop: '1px solid rgba(255,255,255,0.05)', 
                padding: '60px 24px 30px',
                color: '#94A3B8'
              }}>
                <div className="container" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '40px',
                  marginBottom: '40px'
                }}>
                  {/* Brand Column */}
                  <div>
                    <h2 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>
                      BAYA <span style={{ color: '#10B981' }}>SHOP</span>
                    </h2>
                    <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>
                      Redéfinissez votre façon d'acheter en ligne. 
                      Qualité premium, paiement sécurisé et livraison express en Afrique.
                    </p>
                    
                    {/* Newsletter */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ color: '#F8FAFC', fontSize: '0.9rem', marginBottom: '10px' }}>Inscrivez-vous à notre newsletter</h4>
                      <NewsletterForm />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Social Icons Placeholders */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>FB</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>IG</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TW</div>
                    </div>
                  </div>

                  {/* Links Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Navigation</h3>
                    <a href="/" style={{ transition: 'color 0.2s' }}>Accueil</a>
                    <a href="#catalogue" style={{ transition: 'color 0.2s' }}>Catalogue Produits</a>
                    <a href="/wishlist" style={{ transition: 'color 0.2s' }}>Favoris</a>
                    <a href="/cart" style={{ transition: 'color 0.2s' }}>Panier</a>
                  </div>

                  {/* Support Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Support & Aide</h3>
                    <a href="/contact" style={{ transition: 'color 0.2s' }}>Contactez-nous</a>
                    <a href="/faq" style={{ transition: 'color 0.2s' }}>FAQ & Paiements</a>
                    <a href="/conditions" style={{ transition: 'color 0.2s' }}>Conditions Générales</a>
                    <a href="/privacy" style={{ transition: 'color 0.2s' }}>Politique de Confidentialité</a>
                  </div>

                  {/* Contact Info Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Contact</h3>
                    <p>📞 +229 01 63 09 74 98</p>
                    <p>📞 +229 01 53 37 49 53</p>
                    <p>✉️ albert.baya@bayashop.com</p>
                    <p>📍 Cotonou, Bénin</p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ 
                  borderTop: '1px solid rgba(255,255,255,0.05)', 
                  paddingTop: '20px', 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <p>&copy; {new Date().getFullYear()} BAYA SHOP. Tous droits réservés.</p>
                  <p>Conçu par <strong style={{ color: '#F8FAFC' }}>Albert BAYA</strong></p>
                </div>
              </footer>

            </CartProvider>
          </WishlistProvider>
        </AppProvider>
      </body>
    </html>
  );
}
