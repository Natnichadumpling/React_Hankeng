// components/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from './TabBar';  // Import TabBar Component
import HomeScreen from './HomeScreen';
import AccountScreen from './AccountScreen';
import ActivityScreen from './ActivityScreen';
import GroupScreen from './GroupScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const bottomTabs = [
  { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
  { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: true, navigateTo: 'Group3Screen' },
  { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
  { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' },
];

  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} bottomTabs={bottomTabs} />}>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="GroupScreen" component={GroupScreen} />
      <Tab.Screen name="ActivityScreen" component={ActivityScreen} />
      <Tab.Screen name="AccountScreen" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
