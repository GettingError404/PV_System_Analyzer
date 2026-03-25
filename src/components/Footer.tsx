import { Sun } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">PV System Analyzer</span>
      </div>
      <p className="text-xs text-muted-foreground">Built for accurate solar design</p>
      <div className="flex gap-4">
        <span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">About</span>
        <span className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">Guide</span>
      </div>
    </div>
  </footer>
);

export default Footer;
