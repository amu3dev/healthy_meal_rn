import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { COLORS } from '../lib/theme';

export default function MealImage({
  uri,
  label,
  style,
  contentFit = 'cover',
}) {
  const [isLoading, setIsLoading] = useState(Boolean(uri));
  const [hasError, setHasError] = useState(!uri);
  const fallbackLabel = useMemo(() => label || 'Meal photo', [label]);

  useEffect(() => {
    setIsLoading(Boolean(uri));
    setHasError(!uri);
  }, [uri]);

  if (hasError) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        <Text style={styles.fallbackTitle} numberOfLines={2}>
          {fallbackLabel}
        </Text>
        <Text style={styles.fallbackSubtitle}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        transition={180}
        accessibilityLabel={fallbackLabel}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.imageFallbackBackground,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fallbackTitle: {
    color: COLORS.imageFallbackTitle,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: COLORS.imageFallbackSubtitle,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.overlay,
  },
});
