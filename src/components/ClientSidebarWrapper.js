'use client';

import dynamic from 'next/dynamic';

// Désactiver le rendu côté serveur pour ClientSidebar car il utilise
// localStorage et sessionStorage (APIs navigateur uniquement)
const ClientSidebar = dynamic(() => import('./ClientSidebar'), {
  ssr: false,
});

export default function ClientSidebarWrapper() {
  return <ClientSidebar />;
}
