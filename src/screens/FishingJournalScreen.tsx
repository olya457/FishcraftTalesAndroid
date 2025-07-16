import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface JournalEntry {
  date: string;
  location: string;
  tackle: string;
  weight: string;
  species: string;
  notes: string;
  photoUri?: string;
}

const STORAGE_KEY = 'fishing_entries';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const FishingJournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [tackle, setTackle] = useState('');
  const [weight, setWeight] = useState('');
  const [species, setSpecies] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateObject, setSelectedDateObject] = useState(new Date());

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

  const bubblesAndFishStarted = useRef(false);

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
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEntries();

      if (!bubblesAndFishStarted.current) {
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

        floatingFish.forEach((fish) => {
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
        bubblesAndFishStarted.current = true;
      }

      return () => {
      };
    }, [])
  );

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        setEntries(parsedData);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const saveEntries = async (data: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save entries:', error);
    }
  };

  const resetForm = () => {
    setDate('');
    setLocation('');
    setTackle('');
    setWeight('');
    setSpecies('');
    setNotes('');
    setPhotoUri(undefined);
    setEditingIndex(null);
    setSelectedDateObject(new Date());
  };

  const handleAddOrUpdateEntry = () => {
    const updatedEntry: JournalEntry = {
      date,
      location,
      tackle,
      weight,
      species,
      notes,
      photoUri,
    };

    let updatedEntries: JournalEntry[];

    if (editingIndex !== null) {
      updatedEntries = [...entries];
      updatedEntries[editingIndex] = updatedEntry;
    } else {
      updatedEntries = [updatedEntry, ...entries];
    }

    setEntries(updatedEntries);
    saveEntries(updatedEntries);
    resetForm();
    setFormVisible(false);
  };

  const handleEdit = (index: number) => {
    const entry = entries[index];
    setDate(entry.date);
    setLocation(entry.location);
    setTackle(entry.tackle);
    setWeight(entry.weight);
    setSpecies(entry.species);
    setNotes(entry.notes);
    setPhotoUri(entry.photoUri);
    setEditingIndex(index);

    const parsedDate = new Date(entry.date);
    if (!isNaN(parsedDate.getTime())) {
      setSelectedDateObject(parsedDate);
    } else {
      setSelectedDateObject(new Date());
    }

    setFormVisible(true);
  };

  const pickImage = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Gallery access was denied.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      const asset = result.assets?.[0];
      if (asset?.uri) {
        const fileName = `photo_${Date.now()}.jpg`;
        const destination = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        if (
          Platform.OS === 'ios' &&
          (asset.uri.startsWith('ph://') || asset.uri.startsWith('assets-library://'))
        ) {
          await RNFS.copyAssetsFileIOS(asset.uri, destination, 0, 0);
          setPhotoUri('file://' + destination);
        } else {
          await RNFS.copyFile(asset.uri, destination);
          setPhotoUri('file://' + destination);
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Something went wrong while picking the image.');
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || selectedDateObject;
    setShowDatePicker(Platform.OS === 'ios');

    setSelectedDateObject(currentDate);
    setDate(currentDate.toLocaleDateString('en-US'));
  };

  const showDatepickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.fullScreenContainer}>
      {}
      <AnimatedImageBackground
        source={require('../assets/encyclopedia_background.png')}
        style={[styles.background, { transform: [{ scale: backgroundScale }], zIndex: -2 }]}
        resizeMode="cover"
      />

      {}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        {bubbleAnims.map((bubble, i) => (
          <Animated.Image
            key={`bubble-${i}`}
            source={require('../assets/bubble.png')}
            style={{
              position: 'absolute',
              left: bubble.left,
              width: bubble.baseSize,
              height: bubble.baseSize,
              opacity: bubble.opacity,
              transform: [{ translateY: bubble.y }, { scale: bubble.scale }],
            }}
            resizeMode="contain"
          />
        ))}

        {floatingFish.map((fish) => {
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
      {formVisible && (
        <View style={styles.formContainer} pointerEvents={formVisible ? 'auto' : 'none'}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.formContentContainer}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              overScrollMode="never"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerRow}>
                <Pressable onPress={() => { setFormVisible(false); resetForm(); }}>
                  <Text style={styles.backArrow}>←</Text>
                </Pressable>
                <Text style={styles.formTitle}>{editingIndex !== null ? 'Edit Note' : 'New Note'}</Text>
                <View style={{ width: 30 }} />
              </View>

              <Pressable onPress={showDatepickerModal} style={styles.input}>
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date || 'Date'}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={selectedDateObject}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
              )}

              <TextInput placeholder="Location" placeholderTextColor="#ccc" value={location} onChangeText={setLocation} style={styles.input} />
              <TextInput placeholder="Tackle" placeholderTextColor="#ccc" value={tackle} onChangeText={setTackle} style={styles.input} />
              <TextInput placeholder="Weight kg" placeholderTextColor="#ccc" value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Species" placeholderTextColor="#ccc" value={species} onChangeText={setSpecies} style={styles.input} />

              <Pressable onPress={pickImage} style={styles.photoButton}>
                <Text style={styles.photoButtonText}>
                  {photoUri ? 'Change Photo' : 'Add Photo'}
                </Text>
              </Pressable>
              {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} />}

              <TextInput placeholder="Notes" placeholderTextColor="#ccc" value={notes} onChangeText={setNotes} multiline style={[styles.input, { height: 80 }]} />

              <Pressable style={styles.createButton} onPress={handleAddOrUpdateEntry}>
                <Text style={styles.createButtonText}>
                  {editingIndex !== null ? 'Save Changes' : 'Create'}
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {}
      {!formVisible && (
        <View style={styles.container} pointerEvents={formVisible ? 'none' : 'auto'}>
          <Text style={styles.title}>
            Fishing{'\n'}Journal
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
            {entries.length === 0 ? (
              <Text style={styles.noData}>No saved entries yet.</Text>
            ) : (
              <View style={{ marginTop: 30 }}>
                {entries.map((item, index) => (
                  <View key={index} style={styles.entryCard}>
                    <Pressable onPress={() => handleEdit(index)}>
                      <Text style={styles.entryText}>📅 {item.date}</Text>
                      <Text style={styles.entryText}>📍 {item.location}</Text>
                      {item.photoUri && (
                        <Image source={{ uri: item.photoUri }} style={styles.photoThumbnail} />
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <Pressable style={styles.newEntryButton} onPress={() => setFormVisible(true)}>
            <Text style={styles.newEntryText}>New entry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject, 
  },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 0, 
  },
  title: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  noData: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 100,
  },
  newEntryButton: {
    backgroundColor: '#5F82FF',
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    width: 358,
    height: 43,
    borderRadius: 24,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newEntryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  formContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  formContentContainer: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 120,
    flexGrow: 1,
    minHeight: height,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: 'white',
  },
  formTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    justifyContent: 'center',
    minHeight: 45,
    color: 'white',
  },
  inputText: {
    color: 'white',
    fontSize: 16,
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#406AFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  photoPreview: {
    height: 120,
    width: '100%',
    borderRadius: 10,
    marginTop: 12,
  },
  createButton: {
    backgroundColor: '#7B9CFF',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  entryText: {
    color: 'white',
    fontSize: 16,
  },
  photoThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default FishingJournalScreen;