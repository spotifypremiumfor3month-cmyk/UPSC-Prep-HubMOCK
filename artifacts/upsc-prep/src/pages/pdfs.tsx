import React from 'react';
import { useListPdfs, getListPdfsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Search, FileDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Pdfs() {
  const [search, setSearch] = React.useState("");
  const { data: pdfs, isLoading } = useListPdfs({}, { query: { queryKey: getListPdfsQueryKey({}) } });

  const filtered = pdfs?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Study Materials</h1>
          <p className="text-muted-foreground mt-1">Value-added notes, summaries, and standard PDFs.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search materials..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="h-40 animate-pulse bg-muted/30" />)}
        </div>
      ) : filtered.length === 0 ? (
         <div className="py-20 text-center border rounded-lg bg-card border-dashed">
            <FileDown className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No materials found</h3>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(pdf => (
            <Card key={pdf.id} className="group hover:border-primary/50 transition-colors flex flex-col">
              <CardContent className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{pdf.subject}</Badge>
                </div>
                <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors">{pdf.title}</h3>
                {pdf.topic && <p className="text-xs font-medium text-muted-foreground mb-2">{pdf.topic}</p>}
                {pdf.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{pdf.description}</p>}
              </CardContent>
              <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
                <div className="text-xs text-muted-foreground">
                  {(pdf.fileSize / 1024 / 1024).toFixed(1)} MB
                  {pdf.pageCount && ` • ${pdf.pageCount} pages`}
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1 hover:text-primary" onClick={() => window.open(pdf.fileUrl, '_blank')}>
                  <Download className="h-4 w-4" /> View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
