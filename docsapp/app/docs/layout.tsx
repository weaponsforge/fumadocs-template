import { DocsLayout } from "fumadocs-ui/layouts/docs";
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
            {/** {logo} */}
            <span className="font-medium in-[.uwu]:hidden max-md:hidden">
              MU Online
            </span>
          </>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
