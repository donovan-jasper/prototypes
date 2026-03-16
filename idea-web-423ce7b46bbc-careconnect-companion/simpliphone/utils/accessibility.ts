export const getAccessibilityProps = (label, hint) => {
  return {
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button',
  };
};

export const getHighContrastColors = (theme) => {
  return {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderColor: theme.colors.border,
  };
};
