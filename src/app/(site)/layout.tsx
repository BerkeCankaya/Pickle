import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
        {children}
      </main>
    </>
  );
}
