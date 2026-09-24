// src/components/layout/Footer.tsx

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-lg font-medium text-indigo">KalaRead</p>
          <p className="text-sm text-ink/50">Built for the way Nigerians actually learn.</p>
        </div>
        <p className="text-sm text-ink/40">© {new Date().getFullYear()} KalaRead</p>
      </div>
    </footer>
  );
}