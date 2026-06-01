import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

export default function MealImage({
  uri,
  label,
  style,
  contentFit = 'cover',
}) {
  const [isLoading, setIsLoading] = useState(Boolean(uri));
  const [hasError, setHasError] = useState(!uri);
  const fallbackLabel = useMemo(() => label || 'Meal photo', [label]);

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
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#e9efe7',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fallbackTitle: {
    color: '#2f4636',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: '#5f7366',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
});
