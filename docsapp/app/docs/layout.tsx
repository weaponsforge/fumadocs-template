import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const base = baseOptions();

  return (
    <DocsLayout
      {...base}
      tree={source.pageTree}
      nav={{
        ...base.nav,
        title: (
          <>
            <Image
              src="/images/logo_01_64.png"
              alt="ADM  Group"
              width={24}
              height={24}
              aria-hidden="true"
            />

            <div className="font-medium in-[.uwu]:hidden max-md:hidden">
              MU Online
            </div>
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
