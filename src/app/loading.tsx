export default function Loading() {
  // Public pages are server-first and already provide their own stable content.
  // A global spinner can become the only visible UI when mobile hydration or a
  // streamed response is delayed, so keep the root loading boundary invisible.
  return null;
}
