import React from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 font-serif font-bold text-3xl text-primary flex items-center gap-2">
        <span className="text-accent text-4xl leading-none">●</span> Sarthak
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-2xl">Aspirant Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input type="email" placeholder="aspirant@example.com" required defaultValue="demo@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full text-base h-11 mt-2 font-bold" variant="saffron">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Register here</a>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground mb-4">Are you an administrator?</p>
            <Button variant="outline" size="sm" onClick={() => setLocation('/admin')} className="w-full text-xs">
              Go to Admin Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
