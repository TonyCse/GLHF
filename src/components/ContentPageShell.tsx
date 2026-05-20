import type { ReactNode } from "react";

type ContentPageShellProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  contentClassName?: string;
};

export default function ContentPageShell({
  title,
  description,
  icon,
  children,
  maxWidthClassName = "max-w-5xl",
  contentClassName = "",
}: ContentPageShellProps) {
  return (
    <div className="bg-[#232426] px-4 py-10 text-white">
      <div
        className={`mx-auto w-full ${maxWidthClassName} rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 shadow-xl`}
      >
        <div className="flex flex-col items-center text-center">
          {icon && <div className="mb-4">{icon}</div>}
          <h1 className="text-4xl font-extrabold text-white">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-white">{description}</p>}
        </div>

        <div className={`mt-10 ${contentClassName}`.trim()}>{children}</div>
      </div>
    </div>
  );
}
