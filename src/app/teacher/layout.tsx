import { TeacherPasswordGate } from "@/components/teacher/TeacherPasswordGate";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TeacherPasswordGate>{children}</TeacherPasswordGate>;
}
