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
  duration,
  color = 'rgba(8, 145, 178, 0.3)',
}: { 
  size: number; 
  startX: number; 
  delay: number; 
  duration: number;
  color?: string;
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
          backgroundColor: color,
        },
      ]}
    />
  );
};

// Reef Corals SVG
const ReefCorals = ({ opacity = 0.35 }: { opacity?: number }) => (
  <Svg
    width={SCREEN_WIDTH}
    height={280}
    viewBox={`0 0 ${SCREEN_WIDTH} 280`}
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
      <Rect x={SCREEN_WIDTH * 0.06} y={60} width={18} height={160} rx={9} fill="url(#coralCyan)" />
      <Ellipse cx={SCREEN_WIDTH * 0.03} cy={90} rx={14} ry={40} fill="url(#coralCyan)" />
      <Ellipse cx={SCREEN_WIDTH * 0.12} cy={70} rx={16} ry={45} fill="#06b6d4" />
      <Ellipse cx={SCREEN_WIDTH * 0.05} cy={120} rx={10} ry={30} fill="#22d3ee" />
      <Ellipse cx={SCREEN_WIDTH * 0.15} cy={100} rx={12} ry={35} fill="#0891b2" />
    </G>

    {/* Brain Coral - Larger */}
    <Ellipse cx={SCREEN_WIDTH * 0.28} cy={220} rx={55} ry={35} fill="url(#brainCoral)" />
    
    {/* Tube Corals - Center - Taller */}
    <G>
      <Rect x={SCREEN_WIDTH * 0.38} y={100} width={14} height={100} rx={7} fill="url(#coralOrange)" />
      <Rect x={SCREEN_WIDTH * 0.42} y={70} width={16} height={130} rx={8} fill="#f97316" />
      <Rect x={SCREEN_WIDTH * 0.47} y={110} width={12} height={90} rx={6} fill="#fb923c" />
      <Rect x={SCREEN_WIDTH * 0.51} y={80} width={15} height={120} rx={7.5} fill="url(#coralOrange)" />
      <Rect x={SCREEN_WIDTH * 0.56} y={95} width={13} height={105} rx={6.5} fill="#ea580c" />
    </G>

    {/* Fan Coral - Right - Larger */}
    <G>
      <Path
        d={`M${SCREEN_WIDTH * 0.85} 280 
            Q${SCREEN_WIDTH * 0.70} 160 ${SCREEN_WIDTH * 0.85} 40
            Q${SCREEN_WIDTH * 1.0} 160 ${SCREEN_WIDTH * 0.85} 280`}
        fill="url(#coralPink)"
        opacity={0.4}
      />
      <Rect x={SCREEN_WIDTH * 0.84} y={230} width={12} height={50} rx={6} fill="url(#coralPink)" />
    </G>

    {/* Anemone - Larger */}
    <G>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Ellipse
          key={i}
          cx={SCREEN_WIDTH * 0.62 + i * 8 - 36}
          cy={220}
          rx={4}
          ry={30 + Math.sin(i) * 10}
          fill="#f472b6"
          opacity={0.7}
        />
      ))}
    </G>

    {/* Mushroom Corals - Larger */}
    <Ellipse cx={SCREEN_WIDTH * 0.32} cy={250} rx={30} ry={18} fill="url(#coralPurple)" />
    <Ellipse cx={SCREEN_WIDTH * 0.72} cy={255} rx={25} ry={15} fill="#8b5cf6" opacity={0.9} />
    <Ellipse cx={SCREEN_WIDTH * 0.22} cy={265} rx={22} ry={12} fill="#a855f7" opacity={0.8} />

    {/* Seaweed - Taller */}
    <Path
      d={`M${SCREEN_WIDTH * 0.18} 280 
          Q${SCREEN_WIDTH * 0.15} 200 ${SCREEN_WIDTH * 0.19} 150
          Q${SCREEN_WIDTH * 0.22} 100 ${SCREEN_WIDTH * 0.17} 50
          Q${SCREEN_WIDTH * 0.14} 20 ${SCREEN_WIDTH * 0.16} 0`}
      stroke="#10b981"
      strokeWidth={6}
      fill="none"
      opacity={0.6}
    />
    <Path
      d={`M${SCREEN_WIDTH * 0.2} 280 
          Q${SCREEN_WIDTH * 0.23} 180 ${SCREEN_WIDTH * 0.18} 120
          Q${SCREEN_WIDTH * 0.15} 70 ${SCREEN_WIDTH * 0.2} 20`}
      stroke="#059669"
      strokeWidth={5}
      fill="none"
      opacity={0.5}
    />

    {/* Sandy bottom - adjusted for taller coral area */}
    <Path
      d={`M0 280 
          Q${SCREEN_WIDTH * 0.1} 265 ${SCREEN_WIDTH * 0.2} 272
          Q${SCREEN_WIDTH * 0.3} 280 ${SCREEN_WIDTH * 0.4} 268
          Q${SCREEN_WIDTH * 0.5} 256 ${SCREEN_WIDTH * 0.6} 265
          Q${SCREEN_WIDTH * 0.7} 275 ${SCREEN_WIDTH * 0.8} 262
          Q${SCREEN_WIDTH * 0.9} 250 ${SCREEN_WIDTH} 270
          L${SCREEN_WIDTH} 280 Z`}
      fill="#d4a574"
      opacity={0.4}
    />
  </Svg>
);

// Freshwater Plants SVG
const FreshwaterPlants = ({ opacity = 0.35 }: { opacity?: number }) => (
  <Svg
    width={SCREEN_WIDTH}
    height={280}
    viewBox={`0 0 ${SCREEN_WIDTH} 280`}
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

    {/* Tall Plants - Left - Larger */}
    {[0.05, 0.12, 0.18].map((pos, i) => (
      <G key={`left-${i}`}>
        <Path
          d={`M${SCREEN_WIDTH * pos} 280 
              Q${SCREEN_WIDTH * (pos - 0.02)} 200 ${SCREEN_WIDTH * (pos + 0.01)} 120
              Q${SCREEN_WIDTH * pos} 60 ${SCREEN_WIDTH * (pos + 0.01)} 0`}
          stroke={i % 2 === 0 ? "url(#plantGreen1)" : "url(#plantGreen2)"}
          strokeWidth={8 - i}
          fill="none"
        />
        {/* Leaves - Larger */}
        <Ellipse 
          cx={SCREEN_WIDTH * (pos - 0.02)} 
          cy={100 + i * 30} 
          rx={20} 
          ry={8} 
          fill="#22c55e" 
          opacity={0.8}
          transform={`rotate(-30 ${SCREEN_WIDTH * (pos - 0.02)} ${100 + i * 30})`}
        />
        <Ellipse 
          cx={SCREEN_WIDTH * (pos + 0.02)} 
          cy={130 + i * 20} 
          rx={18} 
          ry={7} 
          fill="#10b981" 
          opacity={0.7}
          transform={`rotate(25 ${SCREEN_WIDTH * (pos + 0.02)} ${130 + i * 20})`}
        />
      </G>
    ))}

    {/* Grass Cluster - Center - Taller */}
    {[0.35, 0.38, 0.41, 0.44, 0.47, 0.5].map((pos, i) => (
      <Path
        key={`grass-${i}`}
        d={`M${SCREEN_WIDTH * pos} 280 
            Q${SCREEN_WIDTH * (pos + (i % 2 === 0 ? 0.01 : -0.01))} ${160 - i * 10} 
            ${SCREEN_WIDTH * pos} ${60 - i * 12}`}
        stroke={i % 3 === 0 ? "#059669" : i % 3 === 1 ? "#10b981" : "#22c55e"}
        strokeWidth={4}
        fill="none"
        opacity={0.85}
      />
    ))}

    {/* Broad Leaf Plants - Right - Larger */}
    <G>
      <Ellipse cx={SCREEN_WIDTH * 0.75} cy={160} rx={35} ry={14} fill="#059669" opacity={0.7} transform={`rotate(-20 ${SCREEN_WIDTH * 0.75} 160)`} />
      <Ellipse cx={SCREEN_WIDTH * 0.78} cy={130} rx={32} ry={12} fill="#10b981" opacity={0.6} transform={`rotate(15 ${SCREEN_WIDTH * 0.78} 130)`} />
      <Ellipse cx={SCREEN_WIDTH * 0.73} cy={190} rx={28} ry={11} fill="#22c55e" opacity={0.7} transform={`rotate(-35 ${SCREEN_WIDTH * 0.73} 190)`} />
      <Rect x={SCREEN_WIDTH * 0.755} y={200} width={6} height={80} rx={3} fill="url(#plantGreen1)" />
    </G>

    {/* Tall Plants - Right Side - Larger */}
    {[0.85, 0.9, 0.95].map((pos, i) => (
      <Path
        key={`right-${i}`}
        d={`M${SCREEN_WIDTH * pos} 280 
            Q${SCREEN_WIDTH * (pos + 0.01)} 180 ${SCREEN_WIDTH * (pos - 0.01)} 100
            Q${SCREEN_WIDTH * pos} 40 ${SCREEN_WIDTH * (pos - 0.01)} 0`}
        stroke={i % 2 === 0 ? "url(#plantTeal)" : "url(#plantGreen2)"}
        strokeWidth={7 - i}
        fill="none"
        opacity={0.9}
      />
    ))}

    {/* Substrate - Adjusted */}
    <Path
      d={`M0 280 
          Q${SCREEN_WIDTH * 0.15} 268 ${SCREEN_WIDTH * 0.3} 274
          Q${SCREEN_WIDTH * 0.45} 280 ${SCREEN_WIDTH * 0.6} 270
          Q${SCREEN_WIDTH * 0.75} 260 ${SCREEN_WIDTH * 0.9} 272
          L${SCREEN_WIDTH} 280 Z`}
      fill="#78716c"
      opacity={0.35}
    />
    
    {/* Small pebbles - Larger */}
    {[0.1, 0.25, 0.55, 0.7, 0.88].map((pos, i) => (
      <Circle key={`pebble-${i}`} cx={SCREEN_WIDTH * pos} cy={274} r={5 + i % 3} fill="#a8a29e" opacity={0.4} />
    ))}
  </Svg>
);

// Light Rays Component - More Vibrant
const LightRays = ({ mode = 'reef' }: { mode?: 'reef' | 'freshwater' }) => {
  const rayColor = mode === 'reef' ? '#0891b2' : '#059669';
  
  return (
    <Svg
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      style={styles.lightRays}
    >
      <Defs>
        <LinearGradient id="rayGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.25} />
          <Stop offset="0.3" stopColor={rayColor} stopOpacity={0.1} />
          <Stop offset="1" stopColor={rayColor} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {[0.15, 0.35, 0.55, 0.75, 0.9].map((pos, i) => (
        <Path
          key={i}
          d={`M${SCREEN_WIDTH * pos} 0 
              L${SCREEN_WIDTH * (pos - 0.07)} ${SCREEN_HEIGHT * 0.5} 
              L${SCREEN_WIDTH * (pos + 0.07)} ${SCREEN_HEIGHT * 0.5} Z`}
          fill="url(#rayGradient)"
          opacity={0.4 + i * 0.06}
        />
      ))}
    </Svg>
  );
};

export default function AquaticBackground({
  mode = 'reef',
  showBubbles = true,
  showCorals = true,
  showLightRays = true,
  opacity = 1,
}: AquaticBackgroundProps) {
  // Different bubble colors for reef vs freshwater - more vibrant
  const bubbleColor = mode === 'reef' 
    ? 'rgba(8, 145, 178, 0.5)'  // Cyan for reef - more vibrant
    : 'rgba(5, 150, 105, 0.5)'; // Green for freshwater - more vibrant

  const bubbles = [
    { size: 14, startX: SCREEN_WIDTH * 0.1, delay: 0, duration: 6000 },
    { size: 18, startX: SCREEN_WIDTH * 0.25, delay: 1500, duration: 7000 },
    { size: 22, startX: SCREEN_WIDTH * 0.45, delay: 500, duration: 5500 },
    { size: 16, startX: SCREEN_WIDTH * 0.65, delay: 2500, duration: 8000 },
    { size: 20, startX: SCREEN_WIDTH * 0.8, delay: 1000, duration: 6500 },
    { size: 12, startX: SCREEN_WIDTH * 0.35, delay: 3000, duration: 7500 },
    { size: 15, startX: SCREEN_WIDTH * 0.55, delay: 2000, duration: 6800 },
    { size: 10, startX: SCREEN_WIDTH * 0.9, delay: 800, duration: 5800 },
  ];

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      {/* Light rays from surface */}
      {showLightRays && <LightRays mode={mode} />}

      {/* Animated bubbles */}
      {showBubbles && bubbles.map((bubble, i) => (
        <AnimatedBubble key={i} {...bubble} color={bubbleColor} />
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
