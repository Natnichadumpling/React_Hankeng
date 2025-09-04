import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const Singup2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // รับ hashedPassword จาก route.params
  const { email = '', hashedPassword = '' } = route.params || {};
  const [name, setName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+66');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <ImageBackground
      source={require('./assets/images/p.png')} // ใส่พื้นหลังเป็น p.png
      style={styles.container}
    >
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
          onChangeText={setName}
          placeholderTextColor="rgba(18, 17, 17, 0.7)"
          keyboardType="default"  // รองรับการพิมพ์ภาษาไทย
          textAlign="left" // ตั้งค่าการพิมพ์ให้เป็นไปตามภาษาไทย
          fontFamily="Sarabun"  // ฟอนต์ที่รองรับภาษาไทย
        />

        <View style={styles.phoneContainer}>
          {/* Country Code Dropdown */}
          <Picker
            selectedValue={selectedCountryCode}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
          >
            <Picker.Item label="+66" value="+66" />
            <Picker.Item label="+1" value="+1" />
            <Picker.Item label="+44" value="+44" />
            <Picker.Item label="+81" value="+81" />
          </Picker>
          {/* Phone Number Input */}
          <TextInput
            style={styles.phoneInput}
            placeholder="หมายเลขโทรศัพท์"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)' }]}
          onPress={() => navigation.navigate('Singup3Screen', {
            email,
            hashedPassword,
            name,
            phone: selectedCountryCode + phoneNumber
          })}
        >
          <Text style={styles.buttonText}>ถัดไป</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
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
    paddingHorizontal: 20,
    paddingTop: 0, 
  },
  logoContainer: {
    height: 120,
    width: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // ลดช่องว่างระหว่างโลโก้และฟอร์ม
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
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
    fontFamily: 'Sarabun',  // ฟอนต์ที่รองรับภาษาไทย
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
  phoneInput: {
    width: '70%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
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
});

export default Singup2Screen;
