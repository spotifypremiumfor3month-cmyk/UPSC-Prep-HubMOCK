import React, { useState } from 'react';
import { useListQuestions, getListQuestionsQueryKey, useDeleteQuestion } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function AdminQuestions() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useListQuestions({}, { query: { queryKey: getListQuestionsQueryKey({}) } });
  const deleteMutation = useDeleteQuestion();

  const questions = data?.questions || [];
  
  const filtered = questions.filter(q => 
    q.text.toLowerCase().includes(search.toLowerCase()) || 
    q.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Question deleted");
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey({}) });
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-primary">Question Bank</h1>
          <p className="text-muted-foreground text-sm">Manage all MCQs in the system.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/questions/bulk">
            <Button variant="outline">Bulk Upload</Button>
          </Link>
          <Link href="/admin/questions/new">
            <Button><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search questions..." 
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Question Text</TableHead>
              <TableHead className="w-32">Subject</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No questions found</TableCell></TableRow>
            ) : (
              filtered.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{q.id}</TableCell>
                  <TableCell>
                    <div className="line-clamp-2 text-sm font-medium">{q.text}</div>
                    {q.topic && <div className="text-xs text-muted-foreground mt-1">{q.topic}</div>}
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="font-normal">{q.subject}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      q.difficulty === 'hard' ? 'border-red-200 text-red-700 bg-red-50' : 
                      q.difficulty === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                      'border-green-200 text-green-700 bg-green-50'
                    }>{q.difficulty}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
