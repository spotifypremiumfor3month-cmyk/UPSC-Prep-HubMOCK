import React from 'react';
import { useLocation } from 'wouter';
import { useListTests, getListTestsQueryKey, ListTestsStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, FileText, Search, Target, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function TestsList() {
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [, setLocation] = useLocation();

  const { data: tests, isLoading } = useListTests(
    { status: ListTestsStatus.published },
    { query: { queryKey: getListTestsQueryKey({ status: ListTestsStatus.published }) } }
  );

  const filteredTests = tests?.filter(t => {
    const matchesSub = subjectFilter === "all" || t.subject === subjectFilter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchesSub && matchesSearch;
  }) || [];

  const subjects = Array.from(new Set(tests?.map(t => t.subject) || []));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Mock Tests</h1>
        <p className="text-muted-foreground mt-1">Full length and sectional practice tests.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search test name or description..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted/50 rounded-t-lg" />
              <CardContent className="h-20" />
            </Card>
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="py-20 text-center border rounded-lg bg-card border-dashed">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No tests found</h3>
          <p className="text-sm text-muted-foreground mt-1">Check back later or adjust filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground font-mono text-xs">
                    {test.subject}
                  </Badge>
                  <Badge variant="secondary" className="font-mono">{test.questionCount} Qs</Badge>
                </div>
                <CardTitle className="leading-tight">{test.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {test.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span>{test.totalMarks} Marks</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20 flex justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> {test.attemptCount || 0} attempts
                </div>
                <Button 
                  onClick={() => setLocation(`/tests/${test.id}`)}
                  variant="default"
                  size="sm"
                >
                  Start Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
