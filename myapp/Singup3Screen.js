import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabaseClient';

const Singup3Screen = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+66');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  // รับข้อมูลจาก Singup2Screen
  const { email, hashedPassword, name, phone } = route.params || {};

  // ฟังก์ชันบันทึกข้อมูลลง Supabase
  const handleSignup = async () => {
    // ตรวจสอบอีเมลซ้ำก่อนบันทึก
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);
    if (existing && existing.length > 0) {
      Alert.alert('อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น');
      return;
    }
    // ใช้ข้อมูลจาก route.params ถ้ามี
    const userData = {
      email: email || '',
      password: hashedPassword || '',
      name: name || '',
      phone: phone || (selectedCountryCode + phoneNumber)
    };
    const { data, error } = await supabase
      .from('users')
      .insert([userData]);
    if (error) {
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    } else {
      Alert.alert('สมัครสมาชิกสำเร็จ');
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <ImageBackground source={require('./assets/images/p.png')} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeText}>กลับ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>สมัครใช้งาน</Text>

          {/* Username Form */}
          <TextInput
            style={styles.input}
            placeholder="ชื่อผู้ใช้"
            value={name}
            editable={false}
          />
          <View style={styles.phoneContainer}>
            {/* Country Code Dropdown */}
            <Picker
              selectedValue={phone?.slice(0,3) || '+66'}
              style={styles.picker}
              enabled={false}
            >
              <Picker.Item label={phone?.slice(0,3) || '+66'} value={phone?.slice(0,3) || '+66'} />
            </Picker>
            {/* Phone Number Input */}
            <TextInput
              style={styles.input}
              placeholder="หมายเลขโทรศัพท์"
              value={phone?.slice(3) || ''}
              editable={false}
            />
          </View>

          <Text style={styles.validationText}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)' }]}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          </TouchableOpacity>

          {/* Change Currency */}
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyText}>ฉันใช้ THB (฿) เป็นสกุลเงินของฉัน</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChangeScreen')}>
              <Text style={styles.changeCurrencyText}>เปลี่ยน &gt;&gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Accept Terms and Policies */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>การสมัครใช้งานถือว่าคุณยอมรับ</Text>
            <View style={styles.termsLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Home2Screen')}>
                <Text style={styles.termsLink}>ข้อกำหนดการให้บริการ</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> และ </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home3Screen')}>
                <Text style={styles.termsLink}>นโยบายความเป็นส่วนตัว</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> ของ HarnKeng</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
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
  closeText: {
    color: 'black',
    fontSize: 16,
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
  phoneContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: 100,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
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
  currencyContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 14,
    color: 'black',
  },
  changeCurrencyText: {
    fontSize: 14,
    color: 'rgb(43, 138, 32)',
    textDecorationLine: 'underline',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: 'black',
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsLink: {
    fontSize: 14,
    color: 'rgb(43, 138, 32)',
    textDecorationLine: 'underline',
  },
});

export default Singup3Screen;
