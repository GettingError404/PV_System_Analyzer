import { ArrowDown, Sun } from "lucide-react";
import heroImage from "@/assets/hero-solar.jpg";

const HeroSection = () => {
  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden">
      <img
        src={heroImage}
        alt="Solar panels on rooftop with sunlight"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-xl animate-fade-in">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              PV System Analyzer
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Design Your Solar System in Seconds
          </h1>
          <p className="mb-8 max-w-md text-lg text-white/80">
            Accurate solar sizing based on your real energy usage
          </p>
          <button
            onClick={scrollToCalculator}
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Start Calculating
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
