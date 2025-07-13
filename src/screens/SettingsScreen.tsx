import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Switch,
  Modal,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const bubbleAnims = useRef(
    Array.from({ length: 12 }).map(() => {
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

  

  useEffect(() => {
   
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

    

  }, []); 

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

  return (
    <AnimatedImageBackground
      source={require('../assets/encyclopedia_background.png')}
      style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      resizeMode="cover"
    >
      {}
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

      {}
      {}

      {}
      <View style={styles.container}>
        {}
        <Text
          style={styles.title}
        >
          Settings
        </Text>

        {}
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

          <Pressable
            style={styles.button}
            onPress={() => Linking.openURL('https://www.example.com/privacy-policy')}
          >
            <Text style={styles.buttonText}>Privacy policy</Text>
          </Pressable>
        </View>
      </View>

      {}
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