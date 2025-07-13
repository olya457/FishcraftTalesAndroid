import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';

const { width, height } = Dimensions.get('window');


const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const SplashScreen = ({ navigation }: any) => {
  const blueFishX = useRef(new Animated.Value(-150)).current;
  const yellowFishX = useRef(new Animated.Value(width)).current;
  const purpleFishX = useRef(new Animated.Value(-120)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;

  const bubbleAnims = Array.from({ length: 24 }).map(() => {
    const size = 16 + Math.random() * 24;
    return {
      y: useRef(new Animated.Value(height)).current,
      scale: useRef(new Animated.Value(0.5)).current,
      opacity: useRef(new Animated.Value(0)).current,
      left: Math.random() * (width - 30),
      baseSize: size,
    };
  });

  useEffect(() => {
   
    Animated.loop(
      Animated.sequence([
        Animated.timing(purpleFishX, {
          toValue: width + 100,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(purpleFishX, {
          toValue: -120,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blueFishX, {
          toValue: width + 50,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(blueFishX, {
          toValue: -150,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(yellowFishX, {
          toValue: -150,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(yellowFishX, {
          toValue: width,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

 
    bubbleAnims.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(height);
        bubble.scale.setValue(0.5);
        bubble.opacity.setValue(0);

        Animated.parallel([
          Animated.timing(bubble.y, {
            toValue: -50,
            duration: 4000 + Math.random() * 2000,
            delay: Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.scale, {
            toValue: 1.5,
            duration: 4000,
            delay: Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.opacity, {
            toValue: 1,
            duration: 1000,
            delay: Math.random() * 3000,
            useNativeDriver: true,
          }),
        ]).start(() => animate());
      };
      animate();
    });

 
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundScale, {
          toValue: 1.03,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundScale, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

   
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: backgroundScale }] }}>
        <AnimatedImageBackground
          source={require('../assets/splash.png')}
          style={styles.image}
          resizeMode="cover"
        >
          {}
          {bubbleAnims.map((bubble, index) => (
            <Animated.Image
              key={index}
              source={require('../assets/bubble.png')}
              style={{
                position: 'absolute',
                left: bubble.left,
                width: bubble.baseSize,
                height: bubble.baseSize,
                opacity: bubble.opacity,
                transform: [
                  { translateY: bubble.y },
                  { scale: bubble.scale },
                ],
              }}
              resizeMode="contain"
            />
          ))}

          {}
          <Animated.Image
            source={require('../assets/purple_fish.png')}
            style={[styles.fish, { top: height * 0.15, transform: [{ translateX: purpleFishX }] }]}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('../assets/blue_fish.png')}
            style={[styles.fish, { top: height * 0.68, transform: [{ translateX: blueFishX }] }]}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('../assets/yellow_fish.png')}
            style={[styles.fish, { top: height * 0.43, transform: [{ translateX: yellowFishX }] }]}
            resizeMode="contain"
          />
        </AnimatedImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
  image: {
    width: width,
    height: height,
  },
  fish: {
    position: 'absolute',
    width: 130,
    height: 130,
  },
});

export default SplashScreen;
