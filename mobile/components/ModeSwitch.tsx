import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useAquaMode, MODE_CONFIG, AquaMode } from "../context/AquaModeContext";

interface ModeSwitchProps {
  variant?: "toggle" | "compact" | "full";
  showLabel?: boolean;
  style?: object;
}

export default function ModeSwitch({
  variant = "toggle",
  showLabel = true,
  style,
}: ModeSwitchProps) {
  const { mode, setMode, toggleMode, modeIcon, modeLabel, colors } = useAquaMode();

  // Toggle variant - simple switch
  if (variant === "toggle") {
    return (
      <TouchableOpacity
        onPress={toggleMode}
        style={[styles.toggleContainer, style]}
        activeOpacity={0.8}
      >
        <View style={styles.trackContainer}>
          <View style={styles.track}>
            <View
              style={[
                styles.thumb,
                mode === "reef" ? styles.thumbReef : styles.thumbFresh,
              ]}
            >
              <Text style={styles.thumbIcon}>{modeIcon}</Text>
            </View>
          </View>
        </View>
        {showLabel && (
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {modeLabel}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Compact variant - small badge style
  if (variant === "compact") {
    return (
      <TouchableOpacity
        onPress={toggleMode}
        style={[
          styles.compactContainer,
          { backgroundColor: colors.surface, borderColor: colors.primary },
          style,
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.compactIcon}>{modeIcon}</Text>
        <Text style={[styles.compactLabel, { color: colors.primary }]}>
          {MODE_CONFIG[mode].shortLabel}
        </Text>
      </TouchableOpacity>
    );
  }

  // Full variant - side by side cards
  return (
    <View style={[styles.fullContainer, style]}>
      {(Object.keys(MODE_CONFIG) as AquaMode[]).map((modeKey) => {
        const isActive = mode === modeKey;
        const config = MODE_CONFIG[modeKey];
        return (
          <TouchableOpacity
            key={modeKey}
            onPress={() => setMode(modeKey)}
            style={[
              styles.fullCard,
              isActive && {
                borderColor: config.colors.primary,
                backgroundColor: config.colors.surfaceLight,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.fullIcon}>{config.icon}</Text>
            <Text style={[styles.fullLabel, { color: colors.text }]}>
              {config.label}
            </Text>
            <Text style={[styles.fullDescription, { color: colors.textMuted }]}>
              {config.description}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: config.colors.primary },
                ]}
              >
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Simple mode indicator badge
export function ModeIndicator({ style }: { style?: object }) {
  const { modeIcon, modeLabel, colors, mode } = useAquaMode();

  return (
    <View
      style={[
        styles.indicatorContainer,
        { backgroundColor: colors.surface },
        style,
      ]}
    >
      <Text style={styles.indicatorIcon}>{modeIcon}</Text>
      <Text style={[styles.indicatorLabel, { color: colors.primary }]}>
        {modeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Toggle variant
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  trackContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    width: 56,
    height: 28,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbReef: {
    backgroundColor: "#0891b2",
    marginLeft: 0,
  },
  thumbFresh: {
    backgroundColor: "#059669",
    marginLeft: 28,
  },
  thumbIcon: {
    fontSize: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 100,
  },

  // Compact variant
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  compactIcon: {
    fontSize: 14,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Full variant
  fullContainer: {
    flexDirection: "row",
    gap: 12,
  },
  fullCard: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  fullIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  fullLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  fullDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  activeBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // Indicator badge
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorIcon: {
    fontSize: 12,
  },
  indicatorLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
