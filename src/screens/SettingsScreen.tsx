import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Modal,
  Animated,
  Dimensions,
  ImageBackground,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const bubbleAnims = useRef(
    Array.from({ length: 10 }).map(() => {
      const size = 16 + Math.random() * 24;
      return {
        y: new Animated.Value(height + Math.random() * 100),
        scale: new Animated.Value(0.5),
        opacity: new Animated.Value(0),
        left: Math.random() * (width - size),
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
            toValue: -50,
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
  }, []);

  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );

  const resetAllData = async () => {
    try {
      await AsyncStorage.clear();
      console.log('✅ All data cleared');
    } catch (e) {
      console.error('❌ Failed to clear AsyncStorage', e);
    } finally {
      setModalVisible(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.termsfeed.com/live/c559f06a-244e-4063-a552-157194ba5333');
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
            style={{
              position: 'absolute',
              top: 0,
              left: bubble.left,
              width: bubble.baseSize,
              height: bubble.baseSize,
              opacity: bubble.opacity,
              transform: [{ translateY: bubble.y }, { scale: bubble.scale }],
            }}
            resizeMode="contain"
          />
        ))}
      </View>

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

      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View>
          <View style={styles.row}>
            <Text style={styles.label}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#4CD964' }}
              thumbColor="#fff"
            />
          </View>

          <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Clear journal</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={openPrivacyPolicy}>
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Are you sure you want to reset all journal data?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.removeButton]}
                onPress={resetAllData}
              >
                <Text style={styles.modalButtonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingBottom: 10,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 340,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#406AFF',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    width: 100,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'crimson',
  },
  removeButton: {
    backgroundColor: 'limegreen',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
