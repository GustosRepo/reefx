import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  Ellipse, 
  Defs, 
  LinearGradient, 
  Stop, 
  RadialGradient,
  G,
  Rect
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AquaticBackgroundProps {
  mode?: 'reef' | 'freshwater';
  showBubbles?: boolean;
  showCorals?: boolean;
  showLightRays?: boolean;
  opacity?: number;
}

// Animated Bubble Component
const AnimatedBubble = ({ 
  size, 
  startX, 
  delay, 
  duration 
}: { 
  size: number; 
  startX: number; 
  delay: number; 
  duration: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      opacity.setValue(0.3);
      translateX.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: duration / 3,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: (duration * 2) / 3,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 10,
            duration: duration / 2,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -5,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          left: startX,
          bottom: 50,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    />
  );
};

// Reef Corals SVG
const ReefCorals = ({ opacity = 0.12 }: { opacity?: number }) => (
  <Svg
    width={SCREEN_WIDTH}
    height={200}
    viewBox={`0 0 ${SCREEN_WIDTH} 200`}
    style={[styles.corals, { opacity }]}
  >
    <Defs>
      {/* Coral Gradients */}
      <LinearGradient id="coralCyan" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#0891b2" />
        <Stop offset="1" stopColor="#06b6d4" />
      </LinearGradient>
      <LinearGradient id="coralPink" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#9d174d" />
        <Stop offset="1" stopColor="#ec4899" />
      </LinearGradient>
      <LinearGradient id="coralOrange" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#ea580c" />
        <Stop offset="1" stopColor="#f97316" />
      </LinearGradient>
      <LinearGradient id="coralTeal" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#0f766e" />
        <Stop offset="1" stopColor="#14b8a6" />
      </LinearGradient>
      <LinearGradient id="coralPurple" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#7c3aed" />
        <Stop offset="1" stopColor="#a855f7" />
      </LinearGradient>
      <RadialGradient id="brainCoral" cx="50%" cy="50%">
        <Stop offset="0" stopColor="#14b8a6" />
        <Stop offset="0.5" stopColor="#0d9488" />
        <Stop offset="1" stopColor="#0f766e" />
      </RadialGradient>
    </Defs>

    {/* Branching Coral - Left */}
    <G>
      <Rect x={SCREEN_WIDTH * 0.08} y={80} width={12} height={120} rx={6} fill="url(#coralCyan)" />
      <Ellipse cx={SCREEN_WIDTH * 0.05} cy={100} rx={8} ry={25} fill="url(#coralCyan)" />
      <Ellipse cx={SCREEN_WIDTH * 0.12} cy={90} rx={10} ry={30} fill="#06b6d4" />
      <Ellipse cx={SCREEN_WIDTH * 0.06} cy={120} rx={6} ry={20} fill="#22d3ee" />
    </G>

    {/* Brain Coral */}
    <Ellipse cx={SCREEN_WIDTH * 0.28} cy={175} rx={35} ry={22} fill="url(#brainCoral)" />
    
    {/* Tube Corals - Center */}
    <G>
      <Rect x={SCREEN_WIDTH * 0.4} y={140} width={8} height={60} rx={4} fill="url(#coralOrange)" />
      <Rect x={SCREEN_WIDTH * 0.43} y={120} width={10} height={80} rx={5} fill="#f97316" />
      <Rect x={SCREEN_WIDTH * 0.47} y={150} width={7} height={50} rx={3.5} fill="#fb923c" />
      <Rect x={SCREEN_WIDTH * 0.5} y={130} width={9} height={70} rx={4.5} fill="url(#coralOrange)" />
    </G>

    {/* Fan Coral - Right */}
    <G>
      <Path
        d={`M${SCREEN_WIDTH * 0.85} 200 
            Q${SCREEN_WIDTH * 0.75} 140 ${SCREEN_WIDTH * 0.85} 80
            Q${SCREEN_WIDTH * 0.95} 140 ${SCREEN_WIDTH * 0.85} 200`}
        fill="url(#coralPink)"
        opacity={0.4}
      />
      <Rect x={SCREEN_WIDTH * 0.845} y={175} width={8} height={25} rx={4} fill="url(#coralPink)" />
    </G>

    {/* Anemone */}
    <G>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Ellipse
          key={i}
          cx={SCREEN_WIDTH * 0.62 + i * 6 - 18}
          cy={170}
          rx={2}
          ry={18 + Math.sin(i) * 5}
          fill="#f472b6"
          opacity={0.6}
        />
      ))}
    </G>

    {/* Mushroom Corals */}
    <Ellipse cx={SCREEN_WIDTH * 0.35} cy={188} rx={18} ry={10} fill="url(#coralPurple)" />
    <Ellipse cx={SCREEN_WIDTH * 0.72} cy={190} rx={15} ry={8} fill="#8b5cf6" opacity={0.8} />

    {/* Seaweed */}
    <Path
      d={`M${SCREEN_WIDTH * 0.18} 200 
          Q${SCREEN_WIDTH * 0.16} 160 ${SCREEN_WIDTH * 0.19} 130
          Q${SCREEN_WIDTH * 0.21} 100 ${SCREEN_WIDTH * 0.18} 70
          Q${SCREEN_WIDTH * 0.15} 50 ${SCREEN_WIDTH * 0.17} 30`}
      stroke="#10b981"
      strokeWidth={4}
      fill="none"
      opacity={0.5}
    />
    <Path
      d={`M${SCREEN_WIDTH * 0.2} 200 
          Q${SCREEN_WIDTH * 0.22} 170 ${SCREEN_WIDTH * 0.19} 140
          Q${SCREEN_WIDTH * 0.17} 110 ${SCREEN_WIDTH * 0.2} 80`}
      stroke="#059669"
      strokeWidth={3}
      fill="none"
      opacity={0.4}
    />

    {/* Sandy bottom */}
    <Path
      d={`M0 200 
          Q${SCREEN_WIDTH * 0.1} 190 ${SCREEN_WIDTH * 0.2} 195
          Q${SCREEN_WIDTH * 0.3} 200 ${SCREEN_WIDTH * 0.4} 193
          Q${SCREEN_WIDTH * 0.5} 186 ${SCREEN_WIDTH * 0.6} 192
          Q${SCREEN_WIDTH * 0.7} 198 ${SCREEN_WIDTH * 0.8} 190
          Q${SCREEN_WIDTH * 0.9} 182 ${SCREEN_WIDTH} 195
          L${SCREEN_WIDTH} 200 Z`}
      fill="#d4a574"
      opacity={0.3}
    />
  </Svg>
);

// Freshwater Plants SVG
const FreshwaterPlants = ({ opacity = 0.12 }: { opacity?: number }) => (
  <Svg
    width={SCREEN_WIDTH}
    height={200}
    viewBox={`0 0 ${SCREEN_WIDTH} 200`}
    style={[styles.corals, { opacity }]}
  >
    <Defs>
      <LinearGradient id="plantGreen1" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#059669" />
        <Stop offset="1" stopColor="#10b981" />
      </LinearGradient>
      <LinearGradient id="plantGreen2" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#047857" />
        <Stop offset="1" stopColor="#34d399" />
      </LinearGradient>
      <LinearGradient id="plantTeal" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#0d9488" />
        <Stop offset="1" stopColor="#14b8a6" />
      </LinearGradient>
    </Defs>

    {/* Tall Plants - Left */}
    {[0.05, 0.12, 0.18].map((pos, i) => (
      <G key={`left-${i}`}>
        <Path
          d={`M${SCREEN_WIDTH * pos} 200 
              Q${SCREEN_WIDTH * (pos - 0.02)} 150 ${SCREEN_WIDTH * (pos + 0.01)} 100
              Q${SCREEN_WIDTH * pos} 60 ${SCREEN_WIDTH * (pos + 0.01)} 20`}
          stroke={i % 2 === 0 ? "url(#plantGreen1)" : "url(#plantGreen2)"}
          strokeWidth={6 - i}
          fill="none"
        />
        {/* Leaves */}
        <Ellipse 
          cx={SCREEN_WIDTH * (pos - 0.02)} 
          cy={80 + i * 30} 
          rx={12} 
          ry={5} 
          fill="#22c55e" 
          opacity={0.6}
          transform={`rotate(-30 ${SCREEN_WIDTH * (pos - 0.02)} ${80 + i * 30})`}
        />
        <Ellipse 
          cx={SCREEN_WIDTH * (pos + 0.02)} 
          cy={100 + i * 20} 
          rx={10} 
          ry={4} 
          fill="#10b981" 
          opacity={0.5}
          transform={`rotate(25 ${SCREEN_WIDTH * (pos + 0.02)} ${100 + i * 20})`}
        />
      </G>
    ))}

    {/* Grass Cluster - Center */}
    {[0.35, 0.38, 0.41, 0.44, 0.47, 0.5].map((pos, i) => (
      <Path
        key={`grass-${i}`}
        d={`M${SCREEN_WIDTH * pos} 200 
            Q${SCREEN_WIDTH * (pos + (i % 2 === 0 ? 0.01 : -0.01))} ${140 - i * 8} 
            ${SCREEN_WIDTH * pos} ${80 - i * 10}`}
        stroke={i % 3 === 0 ? "#059669" : i % 3 === 1 ? "#10b981" : "#22c55e"}
        strokeWidth={3}
        fill="none"
        opacity={0.7}
      />
    ))}

    {/* Broad Leaf Plants - Right */}
    <G>
      <Ellipse cx={SCREEN_WIDTH * 0.75} cy={140} rx={25} ry={10} fill="#059669" opacity={0.5} transform={`rotate(-20 ${SCREEN_WIDTH * 0.75} 140)`} />
      <Ellipse cx={SCREEN_WIDTH * 0.78} cy={120} rx={22} ry={9} fill="#10b981" opacity={0.4} transform={`rotate(15 ${SCREEN_WIDTH * 0.78} 120)`} />
      <Ellipse cx={SCREEN_WIDTH * 0.73} cy={160} rx={20} ry={8} fill="#22c55e" opacity={0.5} transform={`rotate(-35 ${SCREEN_WIDTH * 0.73} 160)`} />
      <Rect x={SCREEN_WIDTH * 0.755} y={150} width={4} height={50} rx={2} fill="url(#plantGreen1)" />
    </G>

    {/* Tall Plants - Right Side */}
    {[0.85, 0.9, 0.95].map((pos, i) => (
      <Path
        key={`right-${i}`}
        d={`M${SCREEN_WIDTH * pos} 200 
            Q${SCREEN_WIDTH * (pos + 0.01)} 140 ${SCREEN_WIDTH * (pos - 0.01)} 90
            Q${SCREEN_WIDTH * pos} 50 ${SCREEN_WIDTH * (pos - 0.01)} 30`}
        stroke={i % 2 === 0 ? "url(#plantTeal)" : "url(#plantGreen2)"}
        strokeWidth={5 - i}
        fill="none"
        opacity={0.8}
      />
    ))}

    {/* Substrate */}
    <Path
      d={`M0 200 
          Q${SCREEN_WIDTH * 0.15} 192 ${SCREEN_WIDTH * 0.3} 196
          Q${SCREEN_WIDTH * 0.45} 200 ${SCREEN_WIDTH * 0.6} 194
          Q${SCREEN_WIDTH * 0.75} 188 ${SCREEN_WIDTH * 0.9} 195
          L${SCREEN_WIDTH} 200 Z`}
      fill="#78716c"
      opacity={0.25}
    />
    
    {/* Small pebbles */}
    {[0.1, 0.25, 0.55, 0.7, 0.88].map((pos, i) => (
      <Circle key={`pebble-${i}`} cx={SCREEN_WIDTH * pos} cy={196} r={3 + i % 2} fill="#a8a29e" opacity={0.3} />
    ))}
  </Svg>
);

// Light Rays Component
const LightRays = () => (
  <Svg
    width={SCREEN_WIDTH}
    height={SCREEN_HEIGHT}
    style={styles.lightRays}
  >
    <Defs>
      <LinearGradient id="rayGradient" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#ffffff" stopOpacity={0.15} />
        <Stop offset="0.3" stopColor="#0891b2" stopOpacity={0.05} />
        <Stop offset="1" stopColor="#0891b2" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    {[0.15, 0.35, 0.55, 0.75, 0.9].map((pos, i) => (
      <Path
        key={i}
        d={`M${SCREEN_WIDTH * pos} 0 
            L${SCREEN_WIDTH * (pos - 0.05)} ${SCREEN_HEIGHT * 0.4} 
            L${SCREEN_WIDTH * (pos + 0.05)} ${SCREEN_HEIGHT * 0.4} Z`}
        fill="url(#rayGradient)"
        opacity={0.3 + i * 0.05}
      />
    ))}
  </Svg>
);

export default function AquaticBackground({
  mode = 'reef',
  showBubbles = true,
  showCorals = true,
  showLightRays = true,
  opacity = 1,
}: AquaticBackgroundProps) {
  const bubbles = [
    { size: 8, startX: SCREEN_WIDTH * 0.15, delay: 0, duration: 6000 },
    { size: 6, startX: SCREEN_WIDTH * 0.3, delay: 1500, duration: 7000 },
    { size: 10, startX: SCREEN_WIDTH * 0.5, delay: 500, duration: 5500 },
    { size: 5, startX: SCREEN_WIDTH * 0.7, delay: 2500, duration: 8000 },
    { size: 7, startX: SCREEN_WIDTH * 0.85, delay: 1000, duration: 6500 },
  ];

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      {/* Light rays from surface */}
      {showLightRays && <LightRays />}

      {/* Animated bubbles */}
      {showBubbles && bubbles.map((bubble, i) => (
        <AnimatedBubble key={i} {...bubble} />
      ))}

      {/* Bottom corals/plants */}
      {showCorals && (
        mode === 'reef' ? <ReefCorals /> : <FreshwaterPlants />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(8, 145, 178, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  corals: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  lightRays: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.15,
  },
});
