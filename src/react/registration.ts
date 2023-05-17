export async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration?.unregister();
}