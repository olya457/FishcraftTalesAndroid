import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Image,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const allFish = [
  { name: 'Carp', category: 'Freshwater', image: require('../assets/carp_image.png') },
  { name: 'Dorado', category: 'Marine', image: require('../assets/dorado_image.png') },
  { name: 'Goldfish', category: 'Decorative', image: require('../assets/goldfish_image.png') },
  { name: 'Betta', category: 'Decorative', image: require('../assets/image_betta.png') },
  { name: 'Mackerel', category: 'Marine', image: require('../assets/mackerel_image.png') },
  { name: 'Perch', category: 'Predatory', image: require('../assets/perch_image.png') },
  { name: 'Pike', category: 'Freshwater', image: require('../assets/pike_image.png') },
  { name: 'Roach', category: 'Freshwater', image: require('../assets/roach_image.png') },
  { name: 'Tench', category: 'Freshwater', image: require('../assets/tench_image.png') },
  { name: 'Zander', category: 'Predatory', image: require('../assets/zander_image.png') },
];

const categories = ['All', 'Freshwater', 'Marine', 'Predatory', 'Decorative'];

const FishCard = ({ item, navigation }: { item: typeof allFish[0]; navigation: any }) => (
  <Pressable onPress={() => navigation.navigate('FishDetail', { fish: item })} style={styles.card}>
    <Image source={item.image} style={styles.cardImage} />
    <View style={styles.label}>
      <Text style={styles.labelText}>{item.name}</Text>
    </View>
  </Pressable>
);

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FishEncyclopediaScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const backgroundScale = useRef(new Animated.Value(1)).current;

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

  const bubbleAnims = useRef(
    Array.from({ length: 10 }).map(() => {
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


  const filteredFish =
    selectedCategory === 'All'
      ? allFish
      : allFish.filter((fish) => fish.category === selectedCategory);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toggleDropdown();
  };

  useFocusEffect(
    useCallback(() => {
     
      const backgroundLoop = Animated.loop(
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
      );
      backgroundLoop.start();

   
      const fishAnimations = floatingFish.map(fish => {
        const animateFish = () => {
          const toX = fish.direction === 'left' ? -150 : width + 150;
          fish.x.setValue(fish.direction === 'left' ? width + 150 : -150);
          fish.y.setValue(Math.random() * height);

          return Animated.timing(fish.x, {
            toValue: toX,
            duration: fish.speed,
            useNativeDriver: true,
          });
        };
        const loopFish = Animated.loop(animateFish());
        loopFish.start();
        return loopFish; 
      });


   
      const bubbleAnimationLoops = bubbleAnims.map((bubble) => {
        const animateBubble = () => {
          bubble.y.setValue(height + Math.random() * 100);
          bubble.scale.setValue(0.5);
          bubble.opacity.setValue(0);

          return Animated.parallel([
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
          ]);
        };
        const loopBubble = Animated.loop(animateBubble());
        loopBubble.start();
        return loopBubble; 
      });


      return () => {
       
        backgroundLoop.stop();
        backgroundLoop.reset(); 

        fishAnimations.forEach(loop => loop.stop()); 
        bubbleAnimationLoops.forEach(loop => loop.stop()); 
      };
    }, [backgroundScale, floatingFish, bubbleAnims]) 
  );

  return (
    <Animated.View style={[styles.fullScreenContainer, { transform: [{ scale: backgroundScale }] }]}>
      <AnimatedImageBackground
        source={require('../assets/encyclopedia_background.png')}
        style={styles.background}
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
      </AnimatedImageBackground>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Encyclopedia{'\n'}of Fish</Text>

        <View style={styles.dropdownContainer}>
          <Pressable onPress={toggleDropdown} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedCategory} ⌄</Text>
          </Pressable>

          {dropdownVisible && (
            <View style={styles.dropdownList}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => handleCategorySelect(category)}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{category}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardGrid}>
          {filteredFish.map((item) => (
            <FishCard key={item.name} item={item} navigation={navigation} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },
  dropdownButton: {
    width: 171,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#406AFF',
    fontWeight: '600',
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 171,
    paddingVertical: 4,
    position: 'absolute',
    top: 44,
    left: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - 60) / 2,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FishEncyclopediaScreen;