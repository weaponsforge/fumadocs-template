import Link from "next/link";

interface ButtonLinkProps {
  callback?: () => void;
  href: string;
  styles?: string;
  children?: React.ReactNode;
}

export function ButtonLink(props: ButtonLinkProps) {
  const { callback, href = "", styles = "", children } = props;
  const style = `flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer ${styles}`;

  return (
    <Link href={href} onClick={callback} className={style}>
      {children}
    </Link>
  );
}
