import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import { SUPABASE_URL, SUPABASE_KEY } from '@env';
// console.log(SUPABASE_URL, SUPABASE_KEY);
import HomeScreen from './HomeScreen';
import Home2Screen from './Home2Screen';
import Home3Screen from './Home3Screen';
import Home4Screen from './Home4Screen';
import LoginScreen from './LoginScreen';
import SingupScreen from './SingupScreen';
import Singup2Screen from './Singup2Screen';
import Singup3Screen from './Singup3Screen';
import ChangeScreen from './ChangeScreen';
import PageScreen from './PageScreen';
import Page1Screen from './Page1Screen';
import Page2Screen from './Page2Screen';
import GroupScreen from './GroupScreen';
import Group2Screen from './Group2Screen';
import Group3Screen from './Group3Screen';
import Group4Screen from './Group4Screen'; // เพิ่มการ import Group4Screen
import Group5Screen from './Group5Screen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Home2Screen" component={Home2Screen} />
        <Stack.Screen name="Home3Screen" component={Home3Screen} />
        <Stack.Screen name="Home4Screen" component={Home4Screen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SingupScreen" component={SingupScreen} />
        <Stack.Screen name="Singup2Screen" component={Singup2Screen} />
        <Stack.Screen name="Singup3Screen" component={Singup3Screen} />
        <Stack.Screen name="ChangeScreen" component={ChangeScreen} />
        <Stack.Screen name="PageScreen" component={PageScreen} />
        <Stack.Screen name="Page1Screen" component={Page1Screen} />
        <Stack.Screen name="Page2Screen" component={Page2Screen} />
        <Stack.Screen name="GroupScreen" component={GroupScreen} />
        <Stack.Screen name="Group2Screen" component={Group2Screen} />
        <Stack.Screen name="Group3Screen" component={Group3Screen} />
        <Stack.Screen name="Group4Screen" component={Group4Screen} />
        <Stack.Screen name="Group5Screen" component={Group5Screen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}