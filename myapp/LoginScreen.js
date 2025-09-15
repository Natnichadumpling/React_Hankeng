import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, ImageBackground, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { hashPassword } from './utils/hashPassword';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
  if (!email || !password) {
    global.alert('กรุณากรอกอีเมลและรหัสผ่าน');
    return;
  }
  if (!validateEmail(email)) {
    global.alert('รูปแบบอีเมลไม่ถูกต้อง');
    return;
  }
  if (password.length < 8) {
    global.alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    return;
  }
  setLoading(true);
  const hashedInput = await hashPassword(password);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', hashedInput);
  setLoading(false);
  if (error || !data || data.length === 0) {
    global.alert('เข้าสู่ระบบไม่สำเร็จ\nอีเมลหรือรหัสผ่านไม่ถูกต้อง');
  } else {
    const userData = data[0];
    try {
      await AsyncStorage.setItem('userEmail', userData.email);
      await AsyncStorage.setItem('userName', userData.name);
      console.log('User email and name saved to AsyncStorage:', userData.email, userData.name);
    } catch (storageError) {
      console.error('Failed to save user data to AsyncStorage:', storageError);
    }
    navigation.navigate('PageScreen', {
      userData: {
        name: userData.name,
        email: userData.email,
      },
    });
  }
};

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>
          <Text style={styles.title}>เข้าสู่ระบบ</Text>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="ที่อยู่อีเมล"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={[styles.passwordRow, { marginBottom: 12 }]}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="รหัสผ่าน"
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeButton}
              activeOpacity={0.6}
            >
              <Text style={styles.cuteEyeEmoji}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.validationText}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>
          <TouchableOpacity
            testID="loginButton"
            style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)', marginBottom: 18 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
    minHeight: '100%',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  logoContainer: {
    height: 120,
    width: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    minWidth: 180,
    maxWidth: 320,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minWidth: 180,
    maxWidth: 320,
    marginBottom: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuteEyeEmoji: {
    fontSize: 16,
    textAlign: 'center',
  },
  validationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#232323',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    minWidth: 180,
    maxWidth: 320,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 20, // Added margin to increase spacing from the email input
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  forgotPasswordText: {
    color: 'rgb(2, 99, 53)',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 8,
    alignSelf: 'center',
  },
});

export default LoginScreen;