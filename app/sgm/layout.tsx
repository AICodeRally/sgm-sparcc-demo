import AppLayout from '@/components/AppLayout';

export default function SGMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
