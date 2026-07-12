import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";
import Header from "../components/Header";
import ClientSidebar from "../components/ClientSidebar";
import Footer from "../components/Footer";

export const metadata = {
  title: "BAYA SHOP — Boutique E-Commerce Premium",
  description:
    "Découvrez les meilleures collections sur BAYA SHOP. Électronique, Mode, Horlogerie — livraison rapide et paiement sécurisé Mobile Money & Carte.",
  keywords: "baya shop, e-commerce, Bénin, mobile money, boutique en ligne",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <AppProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <ClientSidebar />
                <main style={{ minHeight: "calc(100vh - 80px)", paddingBottom: "60px" }}>
                  {children}
                </main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
