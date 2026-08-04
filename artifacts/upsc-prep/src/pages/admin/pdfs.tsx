import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useListPdfs } from '@workspace/api-client-react';

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '');
const ADMIN_EMAIL = 'spotifypremiumfor3month@gmail.com';

const SUBJECTS = [
  'History', 'Geography', 'Polity', 'Economy', 'Environment',
  'Science & Technology', 'Ethics', 'Current Affairs', 'CSAT',
  'International Relations', 'Art & Culture', 'Disaster Management',
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminPdfs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pdfs = [], isLoading } = useListPdfs();

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: SUBJECTS[0],
    topic: '',
    description: '',
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Please enter a title before uploading.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Request presigned upload URL
      const urlRes = await fetch(`${BASE_URL}/api/storage/uploads/request-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user?.email ?? '',
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to get upload URL');
      }
      const { uploadURL, objectPath } = await urlRes.json();

      // Step 2: Upload file directly to GCS
      const putRes = await fetch(uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error('Upload to storage failed');

      // Step 3: Save PDF metadata to DB
      const fileUrl = `${BASE_URL}/api/storage${objectPath}`;
      const saveRes = await fetch(`${BASE_URL}/api/pdfs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          subject: form.subject,
          topic: form.topic.trim() || undefined,
          description: form.description.trim() || undefined,
          fileUrl,
          fileSize: file.size,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to save PDF metadata');

      toast.success(`"${form.title}" uploaded successfully.`);
      setForm({ title: '', subject: SUBJECTS[0], topic: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['listPdfs'] });
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
      // reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/pdfs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(`"${title}" deleted.`);
      queryClient.invalidateQueries({ queryKey: ['listPdfs'] });
    } catch {
      toast.error('Could not delete PDF.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Study Materials</h1>
        <p className="text-muted-foreground text-sm">Upload PDF study materials for students.</p>
      </div>

      {/* Upload form */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-base">Upload New PDF</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g. Ancient History Notes"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Subject *</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Topic <span className="text-muted-foreground">(optional)</span></label>
              <Input
                placeholder="e.g. Maurya Empire"
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground">(optional)</span></label>
              <Input
                placeholder="Brief description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <label className={`flex items-center gap-2 w-full justify-center rounded-md border-2 border-dashed p-6 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {uploading ? 'Uploading…' : 'Click to select a PDF file'}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </CardContent>
      </Card>

      {/* Existing PDFs */}
      <div>
        <h2 className="font-semibold text-base mb-3">Uploaded PDFs ({pdfs.length})</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : pdfs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No PDFs uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {pdfs.map((pdf: any) => (
              <div key={pdf.id} className="flex items-center gap-3 p-3 rounded-md border bg-card">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pdf.title}</p>
                  <p className="text-xs text-muted-foreground">{pdf.subject}{pdf.topic ? ` · ${pdf.topic}` : ''} · {formatBytes(pdf.fileSize)}</p>
                </div>
                <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" title="View">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(pdf.id, pdf.title)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
