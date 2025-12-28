import { Heart, Sparkles, Users } from "lucide-react";

const steps = [
  {
    icon: Heart,
    title: "Choose Your Theme",
    description: "Select a deck that matches the moment - romance, friendship, or celebration"
  },
  {
    icon: Sparkles,
    title: "Gather Your People",
    description: "Bring together friends, family, or that special someone for a memorable experience"
  },
  {
    icon: Users,
    title: "Connect & Share",
    description: "Draw cards, share stories, and create lasting bonds through meaningful interaction"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-['Cinzel'] text-foreground">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform any gathering into something special
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-glow">
                  <step.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-6xl font-bold text-primary/10 font-['Cinzel']">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
