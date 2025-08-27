// SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { supabase } from './supabase';  // Import supabase client

const SingupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const navigation = useNavigation();

  // Function to handle user signup
  const handleSignup = async () => {
    if (password.length < 8) {
      setValidationMessage('*Password must be at least 8 characters');
      return;
    }

    try {
      // Sign up user using email and password
      const { data, error } = await supabase
        .from('users')  // Assuming your table name is 'users'
        .insert([
          { email: email, password: password },
        ]);

      if (error) {
        console.log(error.message);
        setValidationMessage('*Something went wrong. Please try again.');
      } else {
        console.log('User registered:', data);
        navigation.navigate('Singup2Screen');  // Navigate to next screen
      }
    } catch (err) {
      console.log(err);
      setValidationMessage('*An error occurred. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.container}
    >
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialCommunityIcons name="home" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Body Content */}
      <View style={styles.body}>
        {/* Logo */}
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
        <Text style={styles.validationText}>{validationMessage}</Text>

        {/* Button to go to next screen */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)' }]} 
          onPress={handleSignup}>
          <Text style={styles.buttonText}>ถัดไป</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  logoContainer: {
    height: 150,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 50,
    color: 'black',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  validationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#232323',
    alignSelf: 'flex-start',
    marginBottom: 30,
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
