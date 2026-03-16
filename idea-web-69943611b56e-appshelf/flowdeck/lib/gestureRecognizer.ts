export const recognizeGesture = (points) => {
  if (points.length < 2) return null;

  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Simple swipe detection
  if (distance > 100) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle > -45 && angle < 45) {
      return 'swipe_right';
    } else if (angle > 45 && angle < 135) {
      return 'swipe_up';
    } else if (angle > 135 || angle < -135) {
      return 'swipe_left';
    } else if (angle > -135 && angle < -45) {
      return 'swipe_down';
    }
  }

  // More complex pattern recognition would go here
  // For MVP, we'll stick with simple swipes

  return null;
};
