import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Pressable,
  Image,
  AppState,
  AppStateStatus,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

interface Card {
  id: string;
  image: any;
  flipped: boolean;
  matched: boolean;
  elevated?: boolean;
  animated: Animated.Value;
}

const cardFaces = [
  require('../assets/carp_image.png'),
  require('../assets/dorado_image.png'),
  require('../assets/image_betta.png'),
  require('../assets/mackerel_image.png'),
  require('../assets/roach_image.png'),
  require('../assets/pike_image.png'),
];

const fishFacts: Record<string, string> = {
  carp_image: 'Carp are bred worldwide and some, like koi, are ornamental.',
  dorado_image: 'Dorado change color after being caught — hence the name "golden".',
  image_betta: 'Betta fish can breathe air using a special labyrinth organ.',
  mackerel_image: 'Mackerels can swim up to 80 km/h and use stripes to coordinate.',
  roach_image: 'Roach typically grow up to 40cm with red fins and eyes.',
  pike_image: 'Pike can hunt even blind, using vibration-detecting organs.',
};

const createShuffledCards = (): Card[] => {
  const duplicated = [...cardFaces, ...cardFaces];
  return duplicated
    .map((image, index) => ({
      id: index.toString(),
      image,
      flipped: false,
      matched: false,
      animated: new Animated.Value(1),
      elevated: false,
    }))
    .sort(() => Math.random() - 0.5);
};

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FishPairGameScreen = () => {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [pairsFound, setPairsFound] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const [cards, setCards] = useState<Card[]>(createShuffledCards());
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [latestMatchImage, setLatestMatchImage] = useState<any | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const isAnimating = useRef(false);

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const bubbleAnims = useRef(
    Array.from({ length: 10 }).map(() => {
      const size = scale(16 + Math.random() * 24);
      return {
        y: new Animated.Value(height + Math.random() * 100),
        scale: new Animated.Value(0.5),
        opacity: new Animated.Value(0),
        left: Math.random() * (width - scale(30)),
        baseSize: size,
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
  }, [backgroundScale]); 

  useEffect(() => {
    let bubbleAnimationTimeouts: NodeJS.Timeout[] = [];
    if (!started) {
      bubbleAnims.forEach((bubble) => {
        const animate = () => {
          bubble.y.setValue(height + Math.random() * 100);
          bubble.scale.setValue(0.5);
          bubble.opacity.setValue(0);

          const animation = Animated.parallel([
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
          animation.start(() => animate()); 
        };
        animate();
      });
    } else {
     
      bubbleAnims.forEach(bubble => {
        bubble.y.stopAnimation();
        bubble.scale.stopAnimation();
        bubble.opacity.stopAnimation();
      
        bubble.opacity.setValue(0);
      });
    }

    return () => {
   
      bubbleAnimationTimeouts.forEach(clearTimeout);
      bubbleAnims.forEach(bubble => {
        bubble.y.stopAnimation();
        bubble.scale.stopAnimation();
        bubble.opacity.stopAnimation();
      });
    };
  }, [started, bubbleAnims]); 

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && timeLeft > 0 && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            setTimeout(() => setShowResult(true), 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (started && timeLeft === 0 && pairsFound < cardFaces.length) {
      setGameOver(true);
      setTimeout(() => {
        setShowResult(true);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, gameOver, pairsFound]);

  useEffect(() => {
    if (started && pairsFound === cardFaces.length && !gameOver) {
      setGameOver(true);
      setTimeout(() => {
        setShowResult(true);
      }, 1000);
    }
  }, [pairsFound, started, gameOver]);

  const resetGame = () => {
    setStarted(false);
   
    setCards(prevCards => createShuffledCards().map(card => ({...card, animated: new Animated.Value(1)})));
    setSelectedCards([]);
    setPairsFound(0);
    setTimeLeft(60);
    setLatestMatchImage(null);
    setGameOver(false);
    setShowResult(false);
    isAnimating.current = false;
  };

  useFocusEffect(
    useCallback(() => {
      resetGame();
    }, [])
  );

  const getImageKey = (imageSource: any) => {
    if (imageSource === require('../assets/carp_image.png')) return 'carp_image';
    if (imageSource === require('../assets/dorado_image.png')) return 'dorado_image';
    if (imageSource === require('../assets/image_betta.png')) return 'image_betta';
    if (imageSource === require('../assets/mackerel_image.png')) return 'mackerel_image';
    if (imageSource === require('../assets/roach_image.png')) return 'roach_image';
    if (imageSource === require('../assets/pike_image.png')) return 'pike_image';
    return '';
  };

  const handleCardPress = (cardId: string) => {
    if (gameOver || isAnimating.current) {
      return;
    }

    const cardToFlip = cards.find(c => c.id === cardId);
    if (selectedCards.length === 2 || cardToFlip?.flipped || cardToFlip?.matched) {
      return;
    }

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    const newSelected = [...selectedCards, cardId];

    setCards(newCards);
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (!firstCard || !secondCard) {
        console.error("Selected cards not found in the array.");
        setSelectedCards([]);
        return;
      }

      if (firstCard.image === secondCard.image) {
        isAnimating.current = true;

        const updatedCards = newCards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, elevated: true }
            : card
        );
        setCards(updatedCards);

        Animated.parallel([
          Animated.timing(firstCard.animated, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(secondCard.animated, {
            toValue: 0,
            duration: 600, 
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true, elevated: false, flipped: false } 
                : card
            )
          );
          setPairsFound(prev => prev + 1);
          setLatestMatchImage(firstCard.image);
          setSelectedCards([]);
          isAnimating.current = false;
        });
      } else {
        isAnimating.current = true;
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, flipped: false }
                : card
            )
          );
          setSelectedCards([]);
          isAnimating.current = false;
        }, 500);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = () => {
    setCards(createShuffledCards().map(card => ({...card, animated: new Animated.Value(1)}))); 
    setSelectedCards([]);
    setPairsFound(0);
    setTimeLeft(60);
    setStarted(true);
    setLatestMatchImage(null);
    setGameOver(false);
    setShowResult(false);
    isAnimating.current = false;
  };

  const renderFishFact = () => {
    if (!latestMatchImage) return null;

    const key = getImageKey(latestMatchImage);
    const fact = fishFacts[key];

    if (!key || !fact) {
      return null;
    }

    return (
      <View style={styles.factBox}>
        <View style={styles.factRow}>
          <Image
            source={require('../assets/fisher_icon.png')}
            style={styles.factIcon}
          />
          <Text style={styles.factText}>{fact}</Text>
        </View>
      </View>
    );
  };

  return (
    <AnimatedImageBackground
      source={require('../assets/encyclopedia_background.png')}
      style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      resizeMode="cover"
    >
      {}
      {!started && (
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
      )}

      <View style={styles.container}>
        {showResult && (
          <View style={styles.resultScreen}>
            <Text style={styles.resultTitle}>YOU SCORED</Text>
            <Text style={styles.resultScore}>{pairsFound}</Text>
            <Text style={styles.resultRecord}>RECORD 6</Text>

            <Pressable style={styles.tryAgainButton} onPress={resetGame}>
              <Text style={styles.tryAgainText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        )}

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {gameOver && !showResult && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>GAME OVER</Text>
            </View>
          )}
        </View>

        {!started ? (
          <>
            <Image
              source={require('../assets/fish_par.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.buttonContainer}>
              <Pressable style={styles.startButton} onPress={handleStart}>
                <Text style={styles.buttonText}>START</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {!gameOver && !showResult && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            )}

            {!gameOver && !showResult && (
              <LinearGradient
                colors={['#1E1E1E', '#FF0000']}
                style={styles.gameBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardGrid}>
                  {cards.map((card) => (
                    <Pressable
                      key={card.id}
                      onPress={() => handleCardPress(card.id)}
                      style={[
                        styles.card,
                        { zIndex: card.elevated ? 2 : 1 },
                      ]}
                      disabled={card.matched || selectedCards.length === 2 || isAnimating.current}
                    >
                      <Animated.View
                        style={{
                          transform: [{ scale: card.animated }],
                          opacity: card.animated,
                        }}
                      >
                        <Image
                          source={
                            card.flipped || card.matched
                              ? card.image
                              : require('../assets/game_game.png')
                          }
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      </Animated.View>
                    </Pressable>
                  ))}
                </View>
              </LinearGradient>
            )}

            {!gameOver && !showResult && renderFishFact()}

            {!gameOver && !showResult && (
                <View style={styles.scoreRow}>
                <Image
                    source={require('../assets/champion.png')}
                    style={styles.championIcon}
                />
                <Text style={styles.scoreText}>{pairsFound}</Text>
                </View>
            )}
          </>
        )}
      </View>
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: verticalScale(60),
    paddingHorizontal: scale(20),
    justifyContent: 'center',
    paddingBottom: verticalScale(60),
  },
  image: {
    width: scale(358),
    height: verticalScale(326),
    marginTop: verticalScale(40),

  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',

  },
  startButton: {
    width: scale(358),
    height: verticalScale(43),
    backgroundColor: '#5F82FF',
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: scale(5),
    elevation: scale(5),
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(17),
    fontWeight: 'bold',
    letterSpacing: scale(1),
  },
  timerText: {
    fontSize: scale(48),
    fontWeight: 'bold',
    color: '#FFB700',
    textAlign: 'center',
  },
  timerContainer: {
    marginTop: verticalScale(0),
    marginBottom: verticalScale(24),
  },
  gameBox: {
    width: scale(338),
    height: verticalScale(365),
    borderRadius: scale(20),
    backgroundColor: '#990000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGrid: {
    width: scale(312),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: scale(96),
    height: verticalScale(74),
    marginBottom: verticalScale(10),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(8),
  },
  factBox: {
    width: scale(358),
    height: verticalScale(100),
    backgroundColor: '#FFB700',
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(10),
  },
  factText: {
    fontSize: scale(15),
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  scoreRow: {
    marginTop: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  championIcon: {
    width: scale(40),
    height: verticalScale(40),
    marginRight: scale(10),
  },
  scoreText: {
    fontSize: scale(26),
    fontWeight: 'bold',
    color: '#fff',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  factIcon: {
    width: scale(50),
    height: verticalScale(50),
    marginRight: scale(-6),
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -scale(176) }, { translateY: -verticalScale(66) }],
    width: scale(352),
    height: verticalScale(132),
    backgroundColor: '#000000EE',
    borderWidth: scale(4),
    borderColor: '#FFB700',
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    color: '#FFB700',
    fontSize: scale(40),
    fontWeight: 'bold',
  },
  resultScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
    zIndex: 30,
  },
  resultTitle: {
    fontSize: scale(34),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: verticalScale(12),
  },
  resultScore: {
    fontSize: scale(80),
    fontWeight: 'bold',
    color: '#FFB700',
  },
  resultRecord: {
    fontSize: scale(22),
    fontWeight: '600',
    color: '#FFB700',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
  },
  tryAgainButton: {
    width: scale(358),
    height: verticalScale(43),
    backgroundColor: '#5F82FF',
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: scale(17),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FishPairGameScreen;