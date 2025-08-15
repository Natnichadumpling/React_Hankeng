import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('./assets/images/p.png')} style={styles.backgroundImage} />

      <View style={styles.innerContainer}>
        {/* Logo Circle */}
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} />
        </View>

        <View style={styles.spacer} />

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'rgb(19, 117, 22)' }]}
          onPress={() => navigation.navigate('SingupScreen')}
        >
          <Text style={styles.buttonText}>สมัครใช้งาน</Text>
        </TouchableOpacity>

        {/* Reduced spacer height for better alignment */}
        <View style={styles.spacerSmall} />

        {/* Login Button - Moved upwards */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'rgb(90, 100, 90)' }]}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          {/* Links at the bottom */}
          <TouchableOpacity onPress={() => navigation.navigate('Home2Screen')}>
            <Text style={styles.footerLink}>ข้อกำหนด</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}> | </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home3Screen')}>
            <Text style={styles.footerLink}>นโยบายความเป็นส่วนตัว</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}> | </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home4Screen')}>
            <Text style={styles.footerLink}>ติดต่อเรา</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 70,
    paddingTop: 50,
    position: 'absolute',
    width: '100%',
  },
  logoContainer: {
    height: 150,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    height: 120,
    width: 120,
    resizeMode: 'cover',
  },
  spacer: {
    height: 150,
  },
  spacerSmall: {
    height: 30, // Reduced the height for better positioning
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  footerLink: {
    fontSize: 14,
    color: 'rgb(2, 99, 53)',
    fontWeight: '500',
  },
  footerText: {
    color: 'grey',
    fontSize: 14,
  },
});

export default HomeScreen;
