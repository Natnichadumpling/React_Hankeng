import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import { hashPassword } from './utils/hashPassword';
import Icon from 'react-native-vector-icons/FontAwesome';


const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      Alert.alert('กรุณากรอกอีเมลและรหัสผ่านใหม่');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    setLoading(true);
    try {
      // ตรวจสอบอีเมลก่อน
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);
      console.log('userData:', userData, 'userError:', userError);
      if (userError || !userData || userData.length === 0) {
        setLoading(false);
        Alert.alert('ไม่พบอีเมลนี้ในระบบ');
        return;
      }
      const hashedPassword = await hashPassword(newPassword);
      console.log('hashedPassword:', hashedPassword);
      const { data, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email);
      console.log('supabase update result:', { data, error });
      setLoading(false);
      if (error) {
        Alert.alert('เกิดข้อผิดพลาด', error.message || 'อัปเดตรหัสผ่านไม่สำเร็จ');
      } else {
        Alert.alert('รีเซ็ตรหัสผ่านสำเร็จ', 'สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่');
        navigation.goBack();
      }
    } catch (err) {
      setLoading(false);
      console.log('catch error:', err);
      Alert.alert('เกิดข้อผิดพลาด', err.message);
    }
  };

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="home" size={28} color="black" />
          <Text style={styles.closeText}>Home</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>
          <Text style={styles.title}>รีเซ็ตรหัสผ่าน</Text>
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
              placeholder="รหัสผ่านใหม่"
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Icon name={showPassword ? 'eye-slash' : 'eye'} size={24} color="#232323" />
            </TouchableOpacity>
          </View>
          <Text style={styles.validationText}>*รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)', marginBottom: 18 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (<Text style={styles.buttonText}>รีเซ็ตรหัสผ่าน</Text>)}
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
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 32,
    paddingLeft: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeText: {
    color: 'black',
    fontSize: 16,
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
  eyeButton: {
    padding: 8,
  },
});

export default ForgotPasswordScreen;
