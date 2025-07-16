import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack'; 

const { width, height } = Dimensions.get('window');

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);


type RootStackParamList = {
  Onboarding: undefined; 
  MainTabs: undefined; 

};

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const onboardingData = [
  {
    background: require('../assets/encyclopedia_background.png'),
    title: 'Welcome to\nFishcraft Tales',
    image: require('../assets/image_onb1.png'),
    description:
      'Is a veteran of sea fishing, calm and wise. He shares proven methods and observations in the tips section.',
    boxText:
      'Fishcraft Tales is a modern and cozy app for anglers and lovers of the underwater world.',
    isFinal: false,
  },
  {
    background: require('../assets/encyclopedia_background.png'),
    title: 'Everything is\ncollected here',
    image: require('../assets/image_onb2.png'),
    description:
      'A young, energetic angler, prefers active fishing methods and sharing life hacks in the directory.',
    boxText:
      'A fish guide, a catch log, useful tips from real fishermen and a relaxing mini-game.',
    isFinal: false,
  },
  {
    background: require('../assets/encyclopedia_background.png'),
    title: 'Fishermen with\ndifferent styles',
    image: require('../assets/image_onb3.png'),
    description:
      'An expert on freshwater rivers and lakes, provides tips and inspiration in the catch log.',
    boxText:
      'You will be accompanied by three characters at all times: Ann, Martin and Leo.',
    isFinal: true,
  },
];

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => { 
  const [index, setIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleX = useRef(new Animated.Value(-width)).current;
  const imageX = useRef(new Animated.Value(width)).current;
  const descX = useRef(new Animated.Value(-width)).current;
  const boxX = useRef(new Animated.Value(width)).current;
  const buttonY = useRef(new Animated.Value(100)).current;

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const bubbleAnims = useRef(
    Array.from({ length: 12 }).map(() => {
      const size = 16 + Math.random() * 24; 
      return {
        y: new Animated.Value(height + Math.random() * 100),
        scale: new Animated.Value(0.5),
        opacity: new Animated.Value(0),
        left: Math.random() * (width - 30),
        baseSize: size, 
      };
    })
  ).current;

  const floatingFish = useRef(
    Array.from({ length: 5 }).map((_, fishIndex) => { 
      const sizes = ['small', 'medium', 'large'];
      const types = ['purple', 'blue', 'yellow'];

      const type = types[fishIndex % types.length];
   
      const direction = type === 'yellow' ? 'left' : 'right';
      const size = sizes[fishIndex % sizes.length];

      const startX = direction === 'left' ? width + 100 : -100;
      const animatedX = new Animated.Value(startX);
      const animatedY = new Animated.Value(Math.random() * height);

      return {
        key: `fish-${fishIndex}`,
        type,
        direction,
        size,
        x: animatedX,
        y: animatedY,
        speed: type === 'yellow' ? 6000 + Math.random() * 2000 : 8000 + Math.random() * 4000,
      };
    })
  ).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    titleX.setValue(-width);
    imageX.setValue(width);
    descX.setValue(-width);
    boxX.setValue(width);
    buttonY.setValue(100);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleX, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(imageX, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(descX, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(boxX, {
        toValue: 0,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonY, {
        toValue: 0,
        duration: 500,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [index]);

  useEffect(() => {
 
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

    bubbleAnims.forEach((bubble) => {
      const animate = () => {
        bubble.y.setValue(height + Math.random() * 100); 
        bubble.scale.setValue(0.5);
        bubble.opacity.setValue(0);

        Animated.parallel([
          Animated.timing(bubble.y, {
            toValue: -height - 50, 
            duration: 4000 + Math.random() * 2000,
            delay: Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.scale, {
            toValue: 1.4,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => animate()); 
      };
      animate();
    });

    floatingFish.forEach(fish => {
      const animate = () => {
        const toX = fish.direction === 'left' ? -150 : width + 150;
        fish.x.setValue(fish.direction === 'left' ? width + 150 : -150); 
        fish.y.setValue(Math.random() * height); 

        Animated.timing(fish.x, {
          toValue: toX,
          duration: fish.speed,
          useNativeDriver: true,
        }).start(() => animate()); 
      };
      animate();
    });

  }, []); 

  const handleNext = () => {
    if (index < onboardingData.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleStart = () => {
    navigation.replace('MainTabs');
  };

  const data = onboardingData[index];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {}
      <AnimatedImageBackground
        source={data.background}
        style={[styles.image, { transform: [{ scale: backgroundScale }] }]}
        resizeMode="cover"
      >
        {}
        <View style={StyleSheet.absoluteFill}>
          {bubbleAnims.map((bubble, i) => (
            <Animated.Image
              key={i}
              source={require('../assets/bubble.png')}
              style={[
                {
                  position: 'absolute',
                  left: bubble.left,
                  width: bubble.baseSize, 
                  height: bubble.baseSize, 
                  opacity: bubble.opacity,
                  transform: [{ translateY: bubble.y }, { scale: bubble.scale }],
                },
              ]}
              resizeMode="contain"
            />
          ))}
        </View>

        {}
        <View style={StyleSheet.absoluteFill}>
          {floatingFish.map((fish, i) => {
            const source =
              fish.type === 'purple'
                ? require('../assets/purple_fish.png')
                : fish.type === 'blue'
                ? require('../assets/blue_fish.png')
                : require('../assets/yellow_fish.png');

            const scaleSize =
              fish.size === 'small' ? 0.5 : fish.size === 'medium' ? 0.8 : 1.1;

            return (
              <Animated.Image
                key={fish.key}
                source={source}
                style={{
                  position: 'absolute',
                  width: 100 * scaleSize,
                  height: 60 * scaleSize,
                  transform: [{ translateX: fish.x }, { translateY: fish.y }],
                  opacity: 0.6, 
                }}
                resizeMode="contain"
              />
            );
          })}
        </View>

        {}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.Text style={[styles.title, { transform: [{ translateX: titleX }] }]}>
            {data.title}
          </Animated.Text>

          <Animated.Image
            source={data.image}
            style={[styles.imageOnb, { transform: [{ translateX: imageX }] }]}
            resizeMode="contain"
          />

          <Animated.Text style={[styles.description, { transform: [{ translateX: descX }] }]}>
            {data.description}
          </Animated.Text>

          <Animated.View style={[styles.infoBox, { transform: [{ translateX: boxX }] }]}>
            <Text style={styles.infoText}>{data.boxText}</Text>
          </Animated.View>

          {}
          <Animated.View style={{ transform: [{ translateY: buttonY }], marginBottom: 20 }}>
            <TouchableOpacity style={styles.button} onPress={data.isFinal ? handleStart : handleNext}>
              <Text style={styles.buttonText}>{data.isFinal ? 'START NOW' : 'NEXT'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </AnimatedImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width,
    height,
  },
  scroll: {
    paddingTop: height * 0.08,
    paddingHorizontal: 24,
    paddingBottom: 20, 
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  imageOnb: {
    width: width * 0.8,            
    height: width * 0.8,           
    maxWidth: 358,                
    maxHeight: 358,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'justify',
    marginBottom: 20,
  },
  infoBox: {
    width: 364,
    height: 92,
    backgroundColor: 'rgba(17, 39, 119, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    width: 358,
    height: 43,
    backgroundColor: '#5F82FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;