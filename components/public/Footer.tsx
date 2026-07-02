import Link from "next/link";

type FooterProps = {
  copyright: string;
};

export function Footer({ copyright }: FooterProps) {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#000000] px-4 py-8 text-center">
      <p className="mx-auto max-w-4xl break-words text-[0.68rem] font-bold uppercase leading-5 tracking-[0.08em] text-[#A3A3A3] sm:text-[0.72rem] sm:tracking-[0.14em]">
        {copyright}
      </p>
      <Link
        href="/admin/login"
        className="mt-3 inline-block text-[0.6rem] font-semibold text-[#3A3A3A] transition hover:text-[#666]"
      >
        Admin
      </Link>
    </footer>
  );
}
