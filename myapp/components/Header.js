// /components/Header.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ userName }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.welcomeText}>สวัสดี !</Text>
      <Text style={styles.nameText}>{userName || '...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
});

export default Header;
