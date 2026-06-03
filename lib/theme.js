export const COLORS = {
  primary: '#4CAF50',
  primaryContrast: '#fff',
  background: '#f5f5f5',
  surface: '#fff',
  textPrimary: '#333',
  textSecondary: '#444',
  textMuted: '#666',
  textSoft: '#555',
  border: '#f0f0f0',
  shadow: '#000',
  switchTrackOff: '#767577',
  switchTrackOn: '#81b0ff',
  switchThumbOff: '#f4f3f4',
  imageFallbackBackground: '#e9efe7',
  imageFallbackTitle: '#2f4636',
  imageFallbackSubtitle: '#5f7366',
  overlay: 'rgba(255, 255, 255, 0.65)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const RADII = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15,
};

export const SHADOWS = {
  soft: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  prominent: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};
