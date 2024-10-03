import revalidateAllRoute from '@/app/actions/revalidate';

// Beware, client component only function
export default function updateSearchParams({
  newSearchParams,
  router,
}: {
  newSearchParams: any;
  router: any;
}) {
  const newUrl = new URL(window.location.href);
  const currentSearchParams = new URLSearchParams(newUrl.search);
  const existingParams = Object.fromEntries(currentSearchParams.entries());
  const mergedParams = { ...existingParams, ...newSearchParams };
  newUrl.search = new URLSearchParams(mergedParams).toString();
  revalidateAllRoute();
  router.push(newUrl.toString());
}
