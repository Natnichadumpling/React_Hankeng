import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('./assets/images/p.png')} // Path to your background image
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="home" size={30} color="black" />
          <Text style={styles.closeText}>Home</Text>  {/* ข้อความต้องห่อด้วย Text */}
          </TouchableOpacity>
        </View>

        


        {/* Body Content */}
        <View style={styles.body}>
          {/* โลโก้ */}
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>เข้าสู่ระบบ</Text>

          {/* Form Inputs */}
          <TextInput
            style={styles.input}
            placeholder="ที่อยู่อีเมล"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน"
            secureTextEntry
            placeholderTextColor="#aaa"
          />

          {/* Validation Message */}
          <Text style={styles.validationText}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>

          {/* Buttons */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: 'rgb(67, 154, 67)' }]} 
            onPress={() => navigation.navigate('PageScreen')}>
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 20,
    paddingLeft: 10,
    width: '100%',
    flexDirection: 'row', // Ensures elements are aligned horizontally
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
    maxWidth: 400, // Set a max width for large screens
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    fontSize: 16, // Adjust font size for readability
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
    maxWidth: 400, // Set a max width for large screens
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
  forgotPasswordText: {
    color: 'rgb(2, 99, 53)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
