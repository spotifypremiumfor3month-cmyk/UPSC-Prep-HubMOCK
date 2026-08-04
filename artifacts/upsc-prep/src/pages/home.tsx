import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 lg:px-12">
        <div className="font-serif font-bold text-2xl text-primary flex items-center gap-2">
          <span className="text-accent text-3xl leading-none">●</span> Sarthak
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/tests" className="text-muted-foreground hover:text-primary transition-colors">Mock Tests</Link>
          <Link href="/daily" className="text-muted-foreground hover:text-primary transition-colors">Daily Practice</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </Link>
           <Link href="/login">
             <Button variant="saffron" className="font-bold">Sign Up Free</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32">
        <Badge />
        <h1 className="font-serif text-5xl lg:text-7xl font-bold text-primary max-w-4xl tracking-tight mt-6 mb-6">
          The serious aspirant's companion for <span className="text-accent">UPSC CSE</span>
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Rigorous daily practice, authentic mock tests, and precise analytics. 
          Built for those studying 10+ hours a day. No distractions, just results.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base h-12 px-8">
               Start Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tests" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-base h-12 px-8">
              Explore Test Series
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">Crafted for Discipline</h2>
            <p className="text-muted-foreground">Everything you need to stay on track, nothing you don't.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Calendar} 
              title="Daily Practice" 
              desc="Fresh MCQs aligned with The Hindu and Indian Express every morning."
            />
            <FeatureCard 
              icon={Target} 
              title="Sectional & Full Tests" 
              desc="Simulate the real exam environment with rigorous mock tests."
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Curated Materials" 
              desc="Value-added notes and summaries, neatly categorized by GS paper."
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border bg-background">
        <p>© {new Date().getFullYear()} Sarthak UPSC Prep. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Badge() {
  return (
    <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
      <ShieldCheck className="mr-2 h-4 w-4" /> Target Prelims 2025
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="border-border shadow-sm bg-background">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{desc}</p>
      </CardContent>
    </Card>
  );
}
