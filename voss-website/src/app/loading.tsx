import { Loader } from "@/components/Loader";

/**
 * The route-level loading UI. Next mounts this inside the root layout's
 * Suspense boundary during any navigation that has to wait, and it covers
 * every nested route that does not define its own — so one file gives the
 * whole site, product pages included, the same moment.
 */
export default function Loading() {
  return <Loader />;
}
