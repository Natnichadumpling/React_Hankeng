import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingScreen = () => {
  const navigation = useNavigation();

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: true }
  ];

  // ฟังก์ชันตัวอย่างเวลากด "กลุ่ม"
  const handleNavigateToGroup3 = () => {
    navigation.navigate('Group3Screen');
  };

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')} // พื้นหลัง
      style={styles.container}
    >
      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomTab, tab.active && styles.bottomTabActive]}
            onPress={() => {
              if (tab.name === 'กลุ่ม') {
                handleNavigateToGroup3();
              }
            }}
          >
            <Image source={tab.icon} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  bottomTabActive: {
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
  },
  bottomTabIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  bottomTabText: {
    fontSize: 12,
    color: '#666',
  },
  bottomTabTextActive: {
    color: '#2c5aa0',
    fontWeight: '600',
  },
});

export default SettingScreen;
