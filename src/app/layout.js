import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AppProvider } from "../context/AppContext";
import Header from "../components/Header";
import ClientSidebar from "../components/ClientSidebar";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "BAYA SHOP - Boutique E-Commerce Moderne",
  description: "Plateforme e-commerce haut de gamme créée par Albert BAYA, avec paiement en ligne Mobile Money & Cartes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr"   data-croll-behavior="smooth"  className={outfit.variable}>
      <body>
        <AppProvider>
          <CartProvider>
            <Header />
            <ClientSidebar />
            <main style={{ minHeight: "calc(100vh - 80px)", paddingBottom: "60px" }}>
              {children}
            </main>
            <footer className="footer">
              <div className="container footer-content">
                <p>&copy; {new Date().getFullYear()} BAYA SHOP. Tous droits réservés.</p>
                <p>Conçu par Albert BAYA -Benin & international</p>
              </div>
            </footer>
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
