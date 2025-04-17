import LoadingSkeleton from '.';

export default function LoadingSkeletonCentered() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <LoadingSkeleton />
    </div>
  );
}
