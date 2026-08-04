import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, FileText, Upload, CalendarDays, ShieldAlert, BookOpen } from 'lucide-react';

export function AdminRoot() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-destructive" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage content, users, and platform settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminLinkCard 
          href="/admin/questions" 
          icon={Database} 
          title="Question Bank" 
          desc="Manage all MCQs, add new ones, or fix errors." 
          color="text-blue-600 bg-blue-50"
        />
        <AdminLinkCard 
          href="/admin/questions/bulk" 
          icon={Upload} 
          title="Bulk Upload" 
          desc="Upload MCQs via CSV/Excel template." 
          color="text-indigo-600 bg-indigo-50"
        />
        <AdminLinkCard 
          href="/admin/tests" 
          icon={FileText} 
          title="Test Series" 
          desc="Create mock tests and assemble question papers." 
          color="text-orange-600 bg-orange-50"
        />
        <AdminLinkCard 
          href="/admin/daily" 
          icon={CalendarDays} 
          title="Daily Schedule" 
          desc="Schedule daily practice sets for aspirants." 
          color="text-green-600 bg-green-50"
        />
        <AdminLinkCard 
          href="/admin/pdfs" 
          icon={BookOpen} 
          title="Study Materials" 
          desc="Upload PDFs, notes, and summaries." 
          color="text-red-600 bg-red-50"
        />
      </div>
    </div>
  );
}

function AdminLinkCard({ href, icon: Icon, title, desc, color }: any) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
