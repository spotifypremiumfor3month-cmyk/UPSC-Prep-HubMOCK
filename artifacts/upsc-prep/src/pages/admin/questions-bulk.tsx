import React, { useState } from 'react';
import { useBulkCreateQuestions, BulkQuestionInput } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// A simple CSV parser for demo purposes. Real apps might use PapaParse.
function parseCSV(text: string) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Simple split (fails on commas inside quotes, but good enough for demo)
    // A regex for better CSV parsing:
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^",\n]*))?(?:,|$)/g;
    const row: string[] = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      if (match[0] === '' && match.index === lines[i].length) break;
      let val = match[1] || match[2] || '';
      val = val.replace(/""/g, '"');
      row.push(val.trim());
    }
    
    if (row.length >= headers.length) {
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      result.push(obj);
    }
  }
  return result;
}

export function AdminQuestionsBulk() {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const bulkCreate = useBulkCreateQuestions();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        setParsedData(data);
      } catch (err) {
        toast.error("Failed to parse CSV file");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    try {
      // Map to correct API shapes
      const mappedQuestions = parsedData.map(row => ({
        text: row.text || row.Question || '',
        optionA: row.optionA || row.A || '',
        optionB: row.optionB || row.B || '',
        optionC: row.optionC || row.C || '',
        optionD: row.optionD || row.D || '',
        correctOption: row.correctOption || row.Correct || 'A',
        explanation: row.explanation || '',
        subject: row.subject || 'GS',
        topic: row.topic || '',
        difficulty: (row.difficulty || 'medium').toLowerCase(),
        year: row.year ? parseInt(row.year) : undefined
      }));

      const res = await bulkCreate.mutateAsync({ data: { questions: mappedQuestions as any } });
      toast.success(`Successfully uploaded ${res.created} questions. ${res.failed} failed.`);
      setParsedData([]);
    } catch (err) {
      toast.error("Upload failed. Check data format.");
    }
  };

  const downloadTemplate = () => {
    const header = "text,optionA,optionB,optionC,optionD,correctOption,explanation,subject,topic,difficulty,year\n";
    const sampleRow = `"Who was the founder of Maurya Empire?","Ashoka","Chandragupta Maurya","Bindusara","Dasharatha","B","Founded in 322 BCE","History","Ancient India","medium",2020\n`;
    const blob = new Blob([header + sampleRow], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upsc_questions_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Bulk Upload MCQs</h1>
        <p className="text-muted-foreground text-sm">Upload multiple questions at once using a CSV file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4 text-muted-foreground">
            <p>1. Download the CSV template.</p>
            <p>2. Fill in your questions. Ensure <strong>correctOption</strong> is exactly A, B, C, or D.</p>
            <p>3. <strong>difficulty</strong> must be easy, medium, or hard.</p>
            <p>4. Save as CSV and upload here.</p>
            <Button onClick={downloadTemplate} variant="outline" className="w-full mt-4">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select your prepared CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow hover:bg-primary/90 transition-colors">
                    Select CSV File
                  </span>
                  <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">or drag and drop your file here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>Found {parsedData.length} rows to import.</CardDescription>
            </div>
            <Button onClick={handleUpload} disabled={bulkCreate.isPending}>
              {bulkCreate.isPending ? "Uploading..." : "Confirm & Import"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Correct</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 100).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs max-w-[300px] truncate" title={row.text}>{row.text}</TableCell>
                      <TableCell className="font-mono">{row.correctOption}</TableCell>
                      <TableCell className="text-xs">{row.subject}</TableCell>
                    </TableRow>
                  ))}
                  {parsedData.length > 100 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground bg-muted/20">
                        And {parsedData.length - 100} more rows...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
