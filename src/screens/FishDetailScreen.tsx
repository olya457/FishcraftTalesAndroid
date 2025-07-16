import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FishDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { fish } = route.params as {
    fish: {
      name: string;
      category: string;
      image: any;
    };
  };

  const [selectedButtons, setSelectedButtons] = useState<string[]>([]);

  const imageAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const tipAnim = useRef(new Animated.Value(0)).current;
  const tipTranslate = useRef(new Animated.Value(30)).current;

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
    const loadTags = async () => {
      try {
        const saved = await AsyncStorage.getItem(`fish_${fish.name}_tags`);
        if (saved) {
          setSelectedButtons(JSON.parse(saved));
        }
      } catch (error) {
        console.warn('Failed to load tags', error);
      }
    };

    loadTags();

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

  
    Animated.timing(imageAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(tipAnim, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(tipTranslate, {
        toValue: 0,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();


    const bubbleTimer = setTimeout(() => {
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
    }, 2000);

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

    return () => {
      clearTimeout(bubbleTimer);
     
    };
  }, []);

  const toggleButton = async (label: string) => {
    const updated = selectedButtons.includes(label)
      ? selectedButtons.filter(b => b !== label)
      : selectedButtons.length < 2
      ? [...selectedButtons, label]
      : selectedButtons;

    setSelectedButtons(updated);

    try {
      await AsyncStorage.setItem(`fish_${fish.name}_tags`, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save tags', error);
    }
  };

  const descriptions: Record<string, any> = {
    Pike: {
      description: 'A predator with an elongated body and sharp teeth. Known for its swift ambush attacks',
      latin: 'Esox lucius',
      habitat: 'Rivers and lakes of Europe, Siberia, and North America',
      preferences: 'Hunts in shoreline vegetation, active in cool water',
      tip: 'A popper or shad at dawn — the pike won’t resist! Just don’t rush the hookset.',
    },
    Dorado: {
      description: 'A powerful marine fish known for its colorful body and strong fight when hooked',
      latin: 'Coryphaena hippurus',
      habitat: 'Warm waters of the Atlantic, Indian, and Pacific Oceans',
      preferences: 'Prefers open ocean near the surface, hunts smaller fish',
      tip: 'Use bright trolling lures — dorado strike fast and fierce!',
    },
    Perch: {
      description: 'Small to medium-sized predator with vertical stripes and spiny dorsal fins',
      latin: 'Perca fluviatilis',
      habitat: 'Lakes and rivers across Europe and northern Asia',
      preferences: 'Prefers calm, weedy waters; active in the morning',
      tip: 'A small spinner or worm near vegetation can lure perch easily.',
    },
    Carp: {
      description: 'Bottom-dwelling fish known for its resilience and challenging catch',
      latin: 'Cyprinus carpio',
      habitat: 'Slow-moving rivers and lakes in Europe and Asia',
      preferences: 'Feeds on bottom, likes warm, shallow water',
      tip: 'Try corn or boilies near reed beds — carp love them!',
    },
    Goldfish: {
      description: 'A domesticated ornamental fish often found in ponds and aquariums',
      latin: 'Carassius auratus',
      habitat: 'Still waters, garden ponds, and slow rivers',
      preferences: 'Feeds on small plants and insects',
      tip: 'Avoid overfeeding — clear water keeps goldfish active.',
    },
    Tench: {
      description: 'Olive-green fish known for being elusive and active at dawn and dusk',
      latin: 'Tinca tinca',
      habitat: 'Lakes and slow rivers in Europe and Western Asia',
      preferences: 'Prefers muddy bottoms and dense vegetation',
      tip: 'Fish at sunrise with worms near lilies — tench loves cover.',
    },
    Mackerel: {
      description: 'Fast-swimming marine fish with iridescent scales and strong schooling behavior',
      latin: 'Scomber scombrus',
      habitat: 'Temperate and tropical seas, especially the Atlantic Ocean',
      preferences: 'Found in large schools near the surface, feeding on small fish',
      tip: 'Use feathers or shiny lures while trolling — they love movement!',
    },
    Zander: {
      description: 'A stealthy predator resembling a mix of perch and pike, known for aggressive bites',
      latin: 'Sander lucioperca',
      habitat: 'Deep lakes and rivers across Europe and western Asia',
      preferences: 'Hunts in deeper water with low light',
      tip: 'Soft plastic lures near drop-offs work best for zander.',
    },
    Betta: {
      description: 'Vibrant tropical fish often kept for its aggressive behavior and stunning colors',
      latin: 'Betta splendens',
      habitat: 'Shallow waters and rice paddies of Southeast Asia',
      preferences: 'Likes still warm water, territorial nature',
      tip: 'Avoid tankmates — bettas prefer solitude and calm.',
    },
    Roach: {
      description: 'Common freshwater fish with a silvery body and reddish fins',
      latin: 'Rutilus rutilus',
      habitat: 'Lakes, ponds, and slow-moving rivers in Europe',
      preferences: 'Feeds near the bottom, active in schools',
      tip: 'Use maggots or bread close to bottom — easy bite!',
    },
  };

  const fishData = descriptions[fish.name] ?? {
    description: 'No data available',
    latin: '-',
    habitat: '-',
    preferences: '-',
    tip: 'No tips available',
  };


  const getFishImage = (type: string, size: string, direction: string) => {
    switch (type) {
      case 'purple':
        return direction === 'left'
          ? require('../assets/purple_fish.png') 
          : require('../assets/purple_fish.png'); 
      case 'blue':
        return direction === 'left'
          ? require('../assets/blue_fish.png') 
          : require('../assets/blue_fish.png'); 
      case 'yellow':
        return direction === 'left'
          ? require('../assets/yellow_fish.png') 
          : require('../assets/yellow_fish.png'); 
      default:
        return require('../assets/blue_fish.png'); 
    }
  };

  const getFishStyle = (size: string) => {
    switch (size) {
      case 'small':
        return { width: 50, height: 30 };
      case 'medium':
        return { width: 70, height: 40 };
      case 'large':
        return { width: 90, height: 50 };
      default:
        return { width: 70, height: 40 };
    }
  };

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

        {}
        {floatingFish.map((f) => (
          <Animated.Image
            key={f.key}
            source={getFishImage(f.type, f.size, f.direction)}
            style={[
              {
                position: 'absolute',
                transform: [{ translateX: f.x }, { translateY: f.y }],
              },
              getFishStyle(f.size),
            ]}
            resizeMode="contain"
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>

        <Text style={[styles.name, { marginTop: 10 }]}>{fish.name}</Text>
        <Text style={styles.category}>{fish.category}</Text>

        <Animated.Image
          source={fish.image}
          style={[
            styles.image,
            {
              opacity: imageAnim,
              transform: [
                {
                  scale: imageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.2, 1],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.View style={{ opacity: contentAnim }}>
          <Text style={styles.description}>{fishData.description}</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Latin name</Text>
            <Text style={styles.infoValue}>{fishData.latin}</Text>

            <Text style={styles.infoLabel}>Habitat</Text>
            <Text style={styles.infoValue}>{fishData.habitat}</Text>

            <Text style={styles.infoLabel}>Preferences</Text>
            <Text style={styles.infoValue}>{fishData.preferences}</Text>
          </View>

          <View style={styles.buttonRow}>
            {['Caught', 'In the plans', 'Favorite fish'].map(label => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.button,
                  selectedButtons.includes(label) && { backgroundColor: '#112777' },
                ]}
                onPress={() => toggleButton(label)}
              >
                <Text style={styles.buttonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.tipContainer,
            {
              opacity: tipAnim,
              transform: [{ translateY: tipTranslate }],
            },
          ]}
        >
          <Image source={require('../assets/fisher_icon.png')} style={styles.tipIcon} />
          <Text style={styles.tipText}>{fishData.tip}</Text>
        </Animated.View>
      </ScrollView>
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 26,
    color: 'white',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  category: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  image: {
    width: width - 60,
    height: 160,
    alignSelf: 'center',
    resizeMode: 'contain',
    borderRadius: 16,
  },
  description: {
    marginTop: 10,
    color: 'white',
    textAlign: 'left',
    fontSize: 17,
    paddingHorizontal: 8,
  },
  infoBlock: {
    marginTop: 20,
  },
  infoLabel: {
    color: '#86B9FF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#86B9FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tipContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  tipText: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 14,
    flex: 1,
  },
});

export default FishDetailScreen;