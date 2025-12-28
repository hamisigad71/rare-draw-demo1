import { Heart, Sparkles, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Meaningful Connections",
    description: "Thoughtfully crafted prompts that spark genuine conversations and deepen relationships"
  },
  {
    icon: Sparkles,
    title: "Memorable Moments",
    description: "Create lasting memories through shared experiences and heartfelt interactions"
  },
  {
    icon: Users,
    title: "Bring People Together",
    description: "Perfect for any gathering - whether intimate moments or group celebrations"
  },
  {
    icon: Globe,
    title: "Universal Themes",
    description: "Explore topics that resonate across cultures, backgrounds, and life experiences"
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-['Cinzel'] text-foreground">
            Why Choose RareDraw?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            More than just cards - tools for building stronger bonds and creating unforgettable shared experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex gap-4 p-6 rounded-lg bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
