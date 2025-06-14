
// Placeholder page for /ultra-lux
import { Gem } from "lucide-react";

export default function UltraLuxPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Gem className="w-16 h-16 text-primary mb-6" />
      <h1 className="text-4xl font-headline font-bold mb-4">Ultra Lux Collection</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl">
        Discover unparalleled luxury. Our Ultra Lux Collection, featuring the world's most exclusive properties and experiences, is being curated and will be unveiled soon.
      </p>
    </div>
  );
}
