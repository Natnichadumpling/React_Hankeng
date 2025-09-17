import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // นำเข้าไอคอน
import { hashPassword } from './utils/hashPassword';

const SingupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('./assets/images/p.png')}
        style={styles.container}
      >

        {/* Body Content */}
        <View style={styles.body}>
          {/* โลโก้ */}
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>สมัครใช้งาน</Text>

          {/* Signup Form */}
          <TextInput
            style={styles.input}
            placeholder="ที่อยู่อีเมล"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Validation Message */}
          <Text style={styles.validationText}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>

          {/* Button to go to next screen */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)' }]} 
            onPress={async () => {
              const hashed = await hashPassword(password);
              navigation.navigate('Singup2Screen', { email, hashedPassword: hashed });
            }}>
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start', // Align content to the top
  },
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 20,
    paddingLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-start', // Align content to the top
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20, // Reduce top padding
  },
  logoContainer: {
    height: 120, // Adjusted size for better alignment
    width: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Reduce spacing
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 22, // Slightly smaller font size
    fontWeight: 'bold',
    marginBottom: 30, // Reduce spacing
    color: 'black',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 10, // Reduce spacing
  },
  validationText: {
    fontSize: 14, // เพิ่มขนาดจาก 12 เป็น 14
    fontWeight: 'bold',
    color: '#232323',
    alignSelf: 'flex-start',
    marginBottom: 20, // Reduce spacing
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default SingupScreen;