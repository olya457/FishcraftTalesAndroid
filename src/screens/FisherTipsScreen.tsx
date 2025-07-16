import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 

const { width, height } = Dimensions.get('window');

const weatherOptions = ['All', 'Foggy', 'Rainy', 'Windy', 'Clear', 'Cloudy'];
const seasonOptions = ['All', 'Summer', 'Autumn', 'Winter', 'Spring'];
const waterOptions = ['All', 'Freshwater', 'River', 'Lake', 'Sea', 'Clear'];

type Tip = {
  id: number;
  weather: string;
  season: string;
  water: string;
  text: string;
  avatar: any;
};

const allTips: Tip[] = [
  {
    id: 1,
    weather: 'Foggy',
    season: 'All',
    water: 'All',
    text: 'Fog on the water means cautious fish. Cast closer to the snags.',
    avatar: require('../assets/fisher1.png'),
  },
  {
    id: 2,
    weather: 'Foggy',
    season: 'All',
    water: 'All',
    text: 'Morning mist on the river sets the stage for quiet hunting.',
    avatar: require('../assets/fisher3.png'),
  },
  {
    id: 3,
    weather: 'Rainy',
    season: 'Summer',
    water: 'River',
    text: 'After a summer rain is the perfect time for surface lures. Splash after splash!',
    avatar: require('../assets/fisher2.png'),
  },
  {
    id: 4,
    weather: 'Windy',
    season: 'Spring',
    water: 'Lake',
    text: 'In spring, the current works in your favor. Fish seek shelter — aim for it.',
    avatar: require('../assets/fisher3.png'),
  },
  {
    id: 5,
    weather: 'Windy',
    season: 'Winter',
    water: 'Sea',
    text: 'In winter, the angler and the water are two solitudes. But the patient one brings home a trophy.',
    avatar: require('../assets/fisher1.png'),
  },
  {
    id: 6,
    weather: 'Clear',
    season: 'Any',
    water: 'Lake',
    text: 'Dusk is my favorite hour. Spinner, pause, twitch — and hold tight!',
    avatar: require('../assets/fisher2.png'),
  },
  {
    id: 7,
    weather: 'Clear',
    season: 'Autumn',
    water: 'Lake',
    text: 'In autumn, the water is clearer. Use thinner leaders and natural colors.',
    avatar: require('../assets/fisher3.png'),
  },
  {
    id: 8,
    weather: 'Cloudy',
    season: 'Any',
    water: 'River',
    text: 'Listen to the water: if seagulls are circling, there’s a feast below.',
    avatar: require('../assets/fisher1.png'),
  },
  {
    id: 9,
    weather: 'Cloudy',
    season: 'Any',
    water: 'Freshwater',
    text: 'Overcast skies? Perfect! Fish are less wary. Try bright-colored lures.',
    avatar: require('../assets/fisher2.png'),
  },
  {
    id: 10,
    weather: 'Any',
    season: 'Autumn',
    water: 'Clear',
    text: 'If the bite’s dead, don’t change the spot — change the approach.',
    avatar: require('../assets/fisher1.png'),
  },
];

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FisherTipsScreen = () => {
  const [selectedWeather, setSelectedWeather] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedWater, setSelectedWater] = useState<string>('All');

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'weather' | 'season' | 'water' | null>(null);

  const backgroundScale = useRef(new Animated.Value(1)).current;

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

 
  useFocusEffect(
    useCallback(() => {
      console.log('FisherTipsScreen focused');

   
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

      const bubbleAnimationLoops = bubbleAnims.map((bubble) => {
        const animateBubble = () => {
      
          bubble.y.setValue(height + Math.random() * 100);
          bubble.scale.setValue(0.5);
          bubble.opacity.setValue(0);

          return Animated.parallel([
            Animated.timing(bubble.y, {
              toValue: -bubble.baseSize - 50,
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
        console.log('FisherTipsScreen unfocused');
       
        backgroundLoop.stop();
        backgroundLoop.reset(); 

        bubbleAnimationLoops.forEach(loop => loop.stop());
      };
    }, [backgroundScale, bubbleAnims]) 
  );

  const openModal = (type: 'weather' | 'season' | 'water') => {
    setActiveFilter(type);
    setModalVisible(true);
  };

  const handleOptionSelect = (option: string) => {
    if (activeFilter === 'weather') setSelectedWeather(option);
    if (activeFilter === 'season') setSelectedSeason(option);
    if (activeFilter === 'water') setSelectedWater(option);
    setModalVisible(false);
  };

  const getOptions = (): string[] => {
    switch (activeFilter) {
      case 'weather': return weatherOptions;
      case 'season': return seasonOptions;
      case 'water': return waterOptions;
      default: return [];
    }
  };

  const getFilterButtonTextColor = (selectedValue: string): string => {
    return selectedValue === 'All' ? '#00387C' : '#406AFF';
  };

  const filteredTips = allTips.filter(tip =>
    (selectedWeather === 'All' || tip.weather === selectedWeather || tip.weather === 'Any') &&
    (selectedSeason === 'All' || tip.season === selectedSeason || tip.season === 'Any') &&
    (selectedWater === 'All' || tip.water === selectedWater || tip.water === 'Any')
  );

  return (
    <AnimatedImageBackground
      source={require('../assets/encyclopedia_background.png')}
      style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      resizeMode="cover"
    >
      {}
      {}
      <View style={{ ...StyleSheet.absoluteFillObject, pointerEvents: 'none' }}>
        {bubbleAnims.map((bubble, i) => (
          <Animated.Image
            key={`bubble-${i}`}
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

      <ScrollView contentContainerStyle={styles.container}>
        {}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Advice from{'\n'} fishermen
          </Text>
        </View>

        {}
        <View style={styles.filtersRow}>
          <Pressable style={styles.filterButton} onPress={() => openModal('weather')}>
            <Text style={[styles.filterText, { color: getFilterButtonTextColor(selectedWeather) }]}>{selectedWeather} ⌄</Text>
          </Pressable>
          <Pressable style={styles.filterButton} onPress={() => openModal('season')}>
            <Text style={[styles.filterText, { color: getFilterButtonTextColor(selectedSeason) }]}>{selectedSeason} ⌄</Text>
          </Pressable>
          <Pressable style={styles.filterButton} onPress={() => openModal('water')}>
            <Text style={[styles.filterText, { color: getFilterButtonTextColor(selectedWater) }]}>{selectedWater} ⌄</Text>
          </Pressable>
        </View>

        {}
        <View style={styles.tipsListContainer}>
          {filteredTips.length === 0 ? (
            <Text style={styles.noTipsText}>No results were found based on the selected criteria.</Text>
          ) : (
            filteredTips.map(tip => (
              <View key={tip.id} style={styles.tipCard}>
                <Image source={tip.avatar} style={styles.avatar} />
                <View style={styles.tipBubble}>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {getOptions().map(option => {
              const isSelected =
                (activeFilter === 'weather' && option === selectedWeather) ||
                (activeFilter === 'season' && option === selectedSeason) ||
                (activeFilter === 'water' && option === selectedWater);

              return (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text
                    style={[
                      styles.modalText,
                      isSelected && { color: '#406AFF', fontWeight: 'bold' },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    paddingTop: 80,
    paddingBottom: 140,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsListContainer: {
    width: '100%',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  avatar: {
    width: 52,
    height: 52,
    marginRight: 12,
    borderRadius: 26,
  },
  tipBubble: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    borderColor: '#406AFF',
    borderWidth: 1,
  },
  tipText: {
    fontSize: 15,
    color: '#333',
  },
  noTipsText: {
    fontSize: 16,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalOption: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
  },
});

export default FisherTipsScreen;