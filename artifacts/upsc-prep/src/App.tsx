import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { Shell } from './components/layout/Shell';

// Pages
import { Home } from './pages/home';
import { Dashboard } from './pages/dashboard';
import { TestsList } from './pages/tests-list';
import { TestDetail } from './pages/test-detail';
import { TestResult } from './pages/test-result';
import { Daily } from './pages/daily';
import { Pdfs } from './pages/pdfs';
import { AdminRoot } from './pages/admin/root';
import { AdminQuestions } from './pages/admin/questions';
import { AdminQuestionsBulk } from './pages/admin/questions-bulk';
import { AdminQuestionsNew, AdminTests, AdminTestsNew, AdminDaily } from './pages/admin/stubs';
import { AdminPdfs } from './pages/admin/pdfs';
import { Login } from './pages/login';
import { useAuth } from './contexts/AuthContext';

function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-primary font-serif">404</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { loading, isAdmin } = useAuth();
  if (loading) return null;

  const adminRoute = (page: ReactNode) =>
    isAdmin ? <Shell>{page}</Shell> : <Login />;

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />

      {/* Protected routes wrapped in Shell */}
      <Route path="/dashboard"><Shell><Dashboard /></Shell></Route>
      <Route path="/tests"><Shell><TestsList /></Shell></Route>

      {/* Test taking is full screen, so no Shell */}
      <Route path="/tests/:id"><TestDetail /></Route>
      <Route path="/tests/:id/result"><Shell><TestResult /></Shell></Route>

      <Route path="/daily"><Shell><Daily /></Shell></Route>
      <Route path="/pdfs"><Shell><Pdfs /></Shell></Route>

      {/* Admin routes */}
      <Route path="/admin">{adminRoute(<AdminRoot />)}</Route>
      <Route path="/admin/questions">{adminRoute(<AdminQuestions />)}</Route>
      <Route path="/admin/questions/new">{adminRoute(<AdminQuestionsNew />)}</Route>
      <Route path="/admin/questions/bulk">{adminRoute(<AdminQuestionsBulk />)}</Route>
      <Route path="/admin/tests">{adminRoute(<AdminTests />)}</Route>
      <Route path="/admin/tests/new">{adminRoute(<AdminTestsNew />)}</Route>
      <Route path="/admin/pdfs">{adminRoute(<AdminPdfs />)}</Route>
      <Route path="/admin/daily">{adminRoute(<AdminDaily />)}</Route>

      <Route component={() => <Shell><NotFound /></Shell>} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppRoutes />
        </WouterRouter>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
