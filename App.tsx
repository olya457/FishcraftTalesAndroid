import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';
import FishDetailScreen from './src/screens/FishDetailScreen'; 

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  FishDetail: {
    fish: {
      name: string;
      category: string;
      image: any;
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="FishDetail" component={FishDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
