import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

import FishEncyclopediaScreen from '../screens/FishEncyclopediaScreen';
import FishingJournalScreen from '../screens/FishingJournalScreen';
import FisherTipsScreen from '../screens/FisherTipsScreen';
import FishPairGameScreen from '../screens/FishPairGameScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = 358;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const icons: Record<string, any> = {
    Encyclopedia: {
      default: require('../assets/encyclopedia_icon.png'),
      active: require('../assets/encyclopedia_icon_active.png'),
    },
    Journal: {
      default: require('../assets/fisherman_magazine_icon.png'),
      active: require('../assets/fisherman_magazine_icon_active.png'),
    },
    Tips: {
      default: require('../assets/tips_from_fishermen_icon.png'),
      active: require('../assets/tips_from_fishermen_icon_active.png'),
    },
    Game: {
      default: require('../assets/game_icon.png'),
      active: require('../assets/game_icon_active.png'),
    },
    Settings: {
      default: require('../assets/settings_icon.png'),
      active: require('../assets/settings_icon_active.png'),
    },
  };

  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
           
            navigation.jumpTo(route.name);
          }
        };

        const icon = isFocused
          ? icons[route.name].active
          : icons[route.name].default;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.iconWrapper}
          >
            <View
              style={[
                styles.iconCircle,
                isFocused && styles.activeBackground,
              ]}
            >
              <Image source={icon} style={styles.icon} resizeMode="contain" />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false, 
      }}
    >
      <Tab.Screen name="Encyclopedia" component={FishEncyclopediaScreen} />
      <Tab.Screen name="Journal" component={FishingJournalScreen} />
      <Tab.Screen name="Tips" component={FisherTipsScreen} />
      <Tab.Screen name="Game" component={FishPairGameScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    alignSelf: 'center',
    width: TAB_BAR_WIDTH,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderColor: '#406AFF',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    backgroundColor: '#406AFF',
  },
  icon: {
    width: 28,
    height: 28,
  },
});

export default MainTabs;
