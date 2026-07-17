export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

export function assertNotDemoMode(): void {
  if (isDemoMode) {
    throw new Error('This action is disabled in demo mode');
  }
}
