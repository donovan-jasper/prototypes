import * as IntentLauncher from 'expo-intent-launcher';

export async function launchApp(packageName: string): Promise<void> {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      package: packageName,
      flags: [
        IntentLauncher.FLAG_ACTIVITY_NEW_TASK,
        IntentLauncher.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED,
      ],
    });
  } catch (error) {
    console.error('Failed to launch app:', error);
    throw error;
  }
}
