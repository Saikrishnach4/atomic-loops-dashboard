// Common formatters and palettes used across dashboard visual components

export const formatDuration = (seconds) => {
  const s = Math.max(0, Math.floor(Number(seconds || 0)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

export const formatNumber = (value) => Number(value || 0).toLocaleString();

// Palettes
export const sessionsColors = ['#64b5f6', '#90caf9', '#1976d2']; // paid, referral, organic
export const categoryBarColor = ['#42a5f5'];
export const genderPieColors = ['#42a5f5', '#ef5350', '#9ccc65'];
export const revenueColors = ['#4fc3f7', '#81c784', '#ffb74d'];


