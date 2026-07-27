import { TopikExamBuilder } from "@/components/admin/TopikExamBuilder";

export default function NewTopikExamPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">New TOPIK exam</h1>
      <div className="mt-8">
        <TopikExamBuilder />
      </div>
    </main>
  );
}
