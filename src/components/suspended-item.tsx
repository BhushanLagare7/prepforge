import { ReactNode, Suspense } from "react";

interface SuspendedItemProps<T> {
  item: Promise<T>;
  fallback: ReactNode;
  result: (item: T) => ReactNode;
}

export const SuspendedItem = <T,>({
  item,
  fallback,
  result,
}: SuspendedItemProps<T>) => {
  return (
    <Suspense fallback={fallback}>
      <InnerComponent item={item} result={result} />
    </Suspense>
  );
};

interface InnerComponentProps<T> {
  item: Promise<T>;
  result: (item: T) => ReactNode;
}

const InnerComponent = async <T,>({ item, result }: InnerComponentProps<T>) => {
  return result(await item);
};
