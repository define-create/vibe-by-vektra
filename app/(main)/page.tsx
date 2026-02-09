import { QuickLogForm } from '@/components/session-log/QuickLogForm';

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="pt-8 pb-6 space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-foreground">
          Log Session
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick post-session reflection
        </p>
      </div>

      <QuickLogForm />
    </main>
  );
}
