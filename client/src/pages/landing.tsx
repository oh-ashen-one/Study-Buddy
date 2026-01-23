import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, Calendar, CheckSquare, MessageSquare, Share2, Sparkles, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to content
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <span className="text-lg font-semibold">Study Buddy</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild data-testid="link-features">
                <a href="#features">Features</a>
              </Button>
              <Button asChild data-testid="button-login">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>AI-Powered Study Assistant</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Your College<br />
                <span className="gradient-text">Command Center</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Stop juggling between apps. Study Buddy combines AI chat, schedule management, 
                and task tracking into one clean, focused experience designed for students.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" asChild data-testid="button-get-started">
                  <a href="/api/login">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                  <a href="#features">Learn More</a>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Free forever plan
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  No credit card required
                </div>
              </div>
            </div>
            
            {/* Right - Hero visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-6">
                {/* Mock chat interface */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium">Study Buddy AI</p>
                      <p className="text-xs text-muted-foreground">Your personal study assistant</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                        <p className="text-sm">What's the best way to study for organic chemistry?</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm mb-2">Great question! Here's a study strategy for organic chemistry:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>1. Master mechanisms, not just memorization</li>
                          <li>2. Use molecular model kits</li>
                          <li>3. Practice problems daily</li>
                        </ul>
                        <p className="text-sm mt-2 text-primary">I found 3 YouTube channels that match your level...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 p-3 rounded-xl bg-card border border-border shadow-lg animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Calendar className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-card border border-border shadow-lg animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <CheckSquare className="w-6 h-6 text-green-500" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for college students who want to stay organized and ace their classes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="AI Study Assistant"
              description="Get personalized study advice, resource recommendations, and help with any subject. Your AI knows your major, courses, and learning style."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Smart Schedule"
              description="Upload your class schedule with a screenshot or paste it directly. We'll parse it and keep everything organized."
            />
            <FeatureCard 
              icon={<CheckSquare className="w-6 h-6" />}
              title="Task Management"
              description="Create to-dos, set due dates, and associate tasks with courses. Never miss a deadline again."
            />
            <FeatureCard 
              icon={<Brain className="w-6 h-6" />}
              title="Course Context"
              description="The AI understands your specific courses and recommends relevant YouTube channels, Khan Academy lessons, and study resources."
            />
            <FeatureCard 
              icon={<Share2 className="w-6 h-6" />}
              title="Share Answers"
              description="Found a great explanation from the AI? Share it with classmates via a link. Collaboration made easy."
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6" />}
              title="STEM & Pre-Law Focus"
              description="Extra-deep recommendations for STEM students and future lawyers. We know these paths require specialized resources."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who are already studying smarter, not harder.
          </p>
          <Button size="lg" className="gap-2" asChild data-testid="button-cta-start">
            <a href="/api/login">
              Start Studying Smarter
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium">Study Buddy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover-elevate transition-colors" data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
