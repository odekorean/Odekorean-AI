import { StudentSidebar } from "@/components/layout/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mist">
      <StudentSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
