import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Animated,
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

const FishCard = ({
  item,
  navigation,
}: {
  item: typeof allFish[0];
  index: number; 
  navigation: any;
}) => {

  return (
    <Pressable
      onPress={() => navigation.navigate('FishDetail', { fish: item })}
      style={styles.card}
    >
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.label}>
        <Text style={styles.labelText}>{item.name}</Text>
      </View>
    </Pressable>
  );
};

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FishEncyclopediaScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dropdownVisible, setDropdownVisible] = useState(false);

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
    Array.from({ length: 5 }).map((_, index) => {
      const sizes = ['small', 'medium', 'large'];
      const types = ['purple', 'blue', 'yellow'];

      const type = types[index % types.length];

      const direction = type === 'yellow' ? 'left' : 'right';
      const size = sizes[index % sizes.length];

      const startX = direction === 'left' ? width + 100 : -100;
      const animatedX = new Animated.Value(startX);
      const animatedY = new Animated.Value(Math.random() * height);

      return {
        key: `fish-${index}`,
        type,
        direction,
        size,
        x: animatedX,
        y: animatedY,
        speed: type === 'yellow' ? 6000 + Math.random() * 2000 : 8000 + Math.random() * 4000,
      };
    })
  ).current;

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

    const animationTimeout = setTimeout(() => {
     
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

    }, 1000); 

    return () => {
      clearTimeout(animationTimeout);
    };
  }, []); 

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible); 
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toggleDropdown();
  };

  const filteredFish =
    selectedCategory === 'All'
      ? allFish
      : allFish.filter((fish) => fish.category === selectedCategory);

  return (
    <AnimatedImageBackground
      source={require('../assets/encyclopedia_background.png')}
      style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      resizeMode="cover"
    >
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

      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Encyclopedia{'\n'}of Fish
        </Text>
      </View>

      <View style={styles.dropdownContainer}>
        <Pressable onPress={toggleDropdown} style={styles.dropdownButton}>
          <Text style={styles.dropdownButtonText}>{selectedCategory} ⌄</Text>
        </Pressable>

        {dropdownVisible && (
          
          <View style={[styles.dropdownList]}>
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

      <FlatList
        data={filteredFish}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <FishCard item={item} index={index} navigation={navigation} />
        )}
      />
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 46,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginTop: 20,
    marginLeft: 20,
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
    textAlign: 'center',
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 171,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    top: 44,
    left: 0,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: 171,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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