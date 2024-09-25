export interface CollapsibleItemProps {
  title: React.ReactNode | string | undefined;
}

export function CollapsibleItem(
  props: React.PropsWithChildren<CollapsibleItemProps>
) {
  const { title, children } = props;

  return (
    <details className="w-full">
      <summary className="w-full drop-shadow-md shadow-slate-900 text-lg font-semibold cursor-pointer">
        {title}
      </summary>
      <div className="flex px-4 py-2 w-full border border-slate-500 rounded-lg justify-center items-center">
        {children}
      </div>
    </details>
  );
}
