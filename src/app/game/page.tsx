import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// This is a simple wrapper component that dynamically imports the client component
function GamePageClientWrapper() {
  const GamePageClient = dynamic(() => import('../components/GamePageClient'), {
    ssr: false
  });
  
  return <GamePageClient />;
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 bg-gradient-primary flex items-center justify-center">
        <div className="text-white">Loading game...</div>
      </div>
    }>
      {/* We use a dynamic import here to ensure the client component is only loaded on the client */}
      <GamePageClientWrapper />
    </Suspense>
  );
} 