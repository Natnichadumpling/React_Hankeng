import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ==== หน้าต่าง ๆ ของคุณ (มีอยู่เดิม) ====
import HomeScreen from './HomeScreen';
import Home2Screen from './Home2Screen';
import Home3Screen from './Home3Screen';
import Home4Screen from './Home4Screen';
import LoginScreen from './LoginScreen';
import SingupScreen from './SingupScreen';
import Singup2Screen from './Singup2Screen';
import Singup3Screen from './Singup3Screen';
import ChangeScreen from './ChangeScreen';
import ProScreen from './ProScreen';
import PageScreen from './PageScreen';
import Page1Screen from './Page1Screen';
import Page2Screen from './Page2Screen';
import GroupScreen from './GroupScreen';
import Group2Screen from './Group2Screen';
import Group3Screen from './Group3Screen';
import Group4Screen from './Group4Screen';   // แนบหลักฐาน
import Group5Screen from './Group5Screen';
import SettingScreen from './SettingScreen';
import Setting2Screen from './Setting2Screen';
import AccountScreen from './AccountScreen';
import ActivityScreen from './ActivityScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import RateAppScreen from './RateAppScreen';
import Group6Screen from './Group6Screen';

// TabBar Component ที่คุณสร้างไว้
import TabBar from './components/TabBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Group" component={GroupScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerTitleAlign: 'center' }}>
        {/* หน้าแรกที่ไม่ใช่ TabNavigator */}
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Home2Screen" component={Home2Screen} />
        <Stack.Screen name="Home3Screen" component={Home3Screen} />
        <Stack.Screen name="Home4Screen" component={Home4Screen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SingupScreen" component={SingupScreen} />
        <Stack.Screen name="Singup2Screen" component={Singup2Screen} />
        <Stack.Screen name="Singup3Screen" component={Singup3Screen} />
        <Stack.Screen name="ChangeScreen" component={ChangeScreen} />
        <Stack.Screen name="ProScreen" component={ProScreen} />
        <Stack.Screen name="PageScreen" component={PageScreen} />
        <Stack.Screen name="Page1Screen" component={Page1Screen} />
        <Stack.Screen name="Page2Screen" component={Page2Screen} />
        <Stack.Screen name="GroupScreen" component={GroupScreen} />
        <Stack.Screen name="Group2Screen" component={Group2Screen} />
        <Stack.Screen name="Group3Screen" component={Group3Screen} />
        <Stack.Screen name="Group4Screen" component={Group4Screen} />
        <Stack.Screen name="Group5Screen" component={Group5Screen} />
        <Stack.Screen name="Setting2Screen" component={Setting2Screen} />
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
        <Stack.Screen name="Group6Screen" component={Group6Screen} options={{ title: 'สรุปรายการโอน' }} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="RateAppScreen" component={RateAppScreen} options={{ title: 'ให้คะแนน HarnKeng' }} />

        {/* เปลี่ยนหน้าหลักให้เป็น TabNavigator */}
        <Stack.Screen
          name="MainTabScreen"
          component={BottomTabNavigator}
          options={{ headerShown: false }} // ซ่อน header สำหรับ TabNavigator
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
