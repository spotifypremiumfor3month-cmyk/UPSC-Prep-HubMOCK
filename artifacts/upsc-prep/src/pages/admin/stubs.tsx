import React from 'react';

export function AdminQuestionsNew() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Add Question</h1>
        <p className="text-muted-foreground text-sm">Create a single MCQ question.</p>
      </div>
      <div className="p-10 border rounded-lg bg-card text-center text-muted-foreground">
        Single question form to be implemented. Please use Bulk Upload for now.
      </div>
    </div>
  );
}

export function AdminTests() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Test Series</h1>
        <p className="text-muted-foreground text-sm">Manage all mock tests.</p>
      </div>
      <div className="p-10 border rounded-lg bg-card text-center text-muted-foreground">
        Test list to be implemented.
      </div>
    </div>
  );
}

export function AdminTestsNew() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Create Test</h1>
        <p className="text-muted-foreground text-sm">Assemble a new mock test.</p>
      </div>
      <div className="p-10 border rounded-lg bg-card text-center text-muted-foreground">
        Test builder to be implemented.
      </div>
    </div>
  );
}

export function AdminPdfs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Study Materials</h1>
        <p className="text-muted-foreground text-sm">Manage uploaded PDFs.</p>
      </div>
      <div className="p-10 border rounded-lg bg-card text-center text-muted-foreground">
        PDF manager to be implemented.
      </div>
    </div>
  );
}

export function AdminDaily() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-primary">Daily Practice</h1>
        <p className="text-muted-foreground text-sm">Schedule daily sets.</p>
      </div>
      <div className="p-10 border rounded-lg bg-card text-center text-muted-foreground">
        Daily scheduler to be implemented.
      </div>
    </div>
  );
}
