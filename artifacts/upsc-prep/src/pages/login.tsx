import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, loading, user } = useAuth();

  useEffect(() => {
    if (user) setLocation('/dashboard');
  }, [setLocation, user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLocation('/dashboard');
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/unauthorized-domain':
          'This website is not authorized in Firebase. Add its domain under Firebase Authentication → Settings → Authorized domains.',
        'auth/operation-not-allowed':
          'Google sign-in is disabled. Enable Google under Firebase Authentication → Sign-in method.',
        'auth/popup-closed-by-user': 'The Google sign-in window was closed before completion.',
        'auth/invalid-api-key': 'The Firebase API key is invalid or missing.',
      };
      toast.error(messages[err?.code] ?? `Sign-in failed${err?.message ? `: ${err.message}` : '. Please try again.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 font-serif font-bold text-3xl text-primary flex items-center gap-2">
        <span className="text-accent text-4xl leading-none">●</span> Sarthak
      </Link>

      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your UPSC dashboard</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            className="w-full h-12 text-base font-semibold flex items-center gap-3"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {/* Google logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M47.532 24.552c0-1.636-.138-3.2-.395-4.695H24.48v9.138h12.952c-.566 2.97-2.24 5.484-4.77 7.17v5.956h7.724c4.52-4.163 7.146-10.3 7.146-17.57z" fill="#4285F4"/>
              <path d="M24.48 48c6.48 0 11.92-2.148 15.893-5.83l-7.724-5.955c-2.148 1.44-4.896 2.29-8.17 2.29-6.28 0-11.6-4.24-13.504-9.934H3.02v6.148C6.977 42.794 15.148 48 24.48 48z" fill="#34A853"/>
              <path d="M10.976 28.57A14.46 14.46 0 0 1 10.24 24c0-1.592.277-3.136.736-4.57v-6.148H3.02A23.968 23.968 0 0 0 .48 24c0 3.878.928 7.548 2.54 10.718l7.956-6.148z" fill="#FBBC05"/>
              <path d="M24.48 9.498c3.54 0 6.714 1.216 9.21 3.604l6.9-6.9C36.393 2.39 30.958 0 24.48 0 15.148 0 6.977 5.206 3.02 13.282l7.956 6.148c1.904-5.694 7.224-9.932 13.504-9.932z" fill="#EA4335"/>
            </svg>
            Sign up / Sign in with Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
