export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore errors if vibration is not supported or allowed
    }
  }
};

export const haptic = {
  light: () => vibrate(10),
  medium: () => vibrate(30),
  heavy: () => vibrate(50),
  success: () => vibrate([10, 50, 20]),
  error: () => vibrate([50, 50, 50]),
};
