import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, ImageBackground, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { hashPassword } from './utils/hashPassword';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (!validateEmail(email)) {
      alert('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (password.length < 8) {
      alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
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
      alert('เข้าสู่ระบบไม่สำเร็จ\nอีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } else {
      const userData = data[0];
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
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#232323" />
            </TouchableOpacity>
          </View>
          <Text style={styles.validationText}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>
          <TouchableOpacity
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    minHeight: '100%',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  logoContainer: {
    height: 140,
    width: 140,
    backgroundColor: 'white',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
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
    marginBottom: 10,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minWidth: 180,
    maxWidth: 320,
    marginBottom: 10,
  },
  eyeButton: {
    paddingHorizontal: 8,
  },
  validationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#232323',
    alignSelf: 'flex-start',
    marginBottom: 14,
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
    marginBottom: 10,
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
