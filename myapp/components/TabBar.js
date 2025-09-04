// components/TabBar.js
import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TabBar = ({ bottomTabs }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomTabBar}>
      {bottomTabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.name || index}
          style={[styles.iconButton, tab.active && styles.bottomTabActive]}
          onPress={() => {
            if (tab.navigateTo) {
              navigation.navigate(tab.navigateTo);  // Navigate to the corresponding screen
            }
          }}
        >
          <Image source={tab.icon} style={styles.bottomTabIcon} />
          <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    height: 70,  // กำหนดความสูงของ TabBar ให้เท่ากัน
  },
  iconButton: {
    alignItems: 'center',
    flex: 1,  // Ensures each button takes equal space
    justifyContent: 'center',
    padding: 5,
  },
  bottomTabIcon: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  bottomTabText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  bottomTabActive: {
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
  },
  bottomTabTextActive: {
    color: '#2c5aa0',  // ฟ้าเมื่อคลิก
    fontWeight: '600',
  },
});

export default TabBar;
