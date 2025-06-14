
// Placeholder page for /tours
import { Construction } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Construction className="w-16 h-16 text-primary mb-6" />
      <h1 className="text-4xl font-headline font-bold mb-4">Tours & Cruises</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl">
        Our Tours & Cruises section is currently under construction. Exciting travel packages and cruise deals are coming soon!
      </p>
    </div>
  );
}
