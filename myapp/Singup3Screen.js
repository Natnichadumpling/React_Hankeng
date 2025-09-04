import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './supabaseClient';

const Singup3Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // รับค่าจากหน้าก่อน
  const { email, hashedPassword, name, phone } = route.params || {};

  // สำรองกรณีไม่มี phone จากหน้าก่อน
  const [selectedCountryCode] = useState('+66');
  const [phoneNumber] = useState('');

  const handleSignup = async () => {
    const { data: existing, error: checkErr } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (checkErr) {
      Alert.alert('เกิดข้อผิดพลาด', checkErr.message);
      return;
    }
    if (existing && existing.length > 0) {
      Alert.alert('อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น');
      return;
    }

    const userData = {
      email: email || '',
      password: hashedPassword || '',
      name: name || '',
      phone: phone || `${selectedCountryCode}${phoneNumber}`,
    };

    const { error } = await supabase.from('users').insert([userData]);
    if (error) {
      Alert.alert('เกิดข้อผิดพลาด', error.message);
    } else {
      Alert.alert('สมัครสมาชิกสำเร็จ');
      navigation.navigate('HomeScreen');
    }
  };

  // แยก code/เบอร์จาก route (ถ้ามี)
  const codeFromRoute = phone?.slice(0, 3) || '+66';
  const numFromRoute = phone?.slice(3) || '';

  return (
    <ImageBackground
      source={require('./assets/images/p.png')}
      style={styles.bg}
      imageStyle={styles.bgImg}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* AppBar (โปร่งใส) */}
            <View style={styles.appBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>‹ กลับ</Text>
              </TouchableOpacity>
            </View>

            {/* เนื้อหากลางจอ — ไม่มีกรอบขาว */}
            <View style={styles.formWrap}>
              {/* โลโก้ */}
              <Image source={require('./assets/images/logo.png')} style={styles.logo} />

              <Text style={styles.title}>สมัครใช้งาน</Text>

              {/* ชื่อผู้ใช้ (อ่านอย่างเดียว) */}
              <TextInput
                style={styles.input}
                value={name || ''}
                editable={false}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor="rgba(18, 17, 17, 0.7)"
              />

              {/* เบอร์โทร (อ่านอย่างเดียวจาก route) */}
              <View style={styles.phoneRow}>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={codeFromRoute}
                    enabled={false}
                    style={styles.picker}
                    dropdownIconColor="#101010ff"
                  >
                    <Picker.Item label={codeFromRoute} value={codeFromRoute} color="#000" />
                  </Picker>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={numFromRoute}
                  editable={false}
                  placeholder="หมายเลขโทรศัพท์"
                  placeholderTextColor="rgba(19, 18, 18, 0.7)"
                />
              </View>

              <Text style={styles.hint}>*ต้องมีตัวอักขระอย่างน้อย 8 ตัว</Text>

              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSignup}>
                <Text style={styles.btnText}>สมัครสมาชิก</Text>
              </TouchableOpacity>

              {/* Terms */}
              <View style={styles.centerBlock}>
                <Text style={styles.normalText}>การสมัครใช้งานถือว่าคุณยอมรับ</Text>
                <View style={styles.termsRow}>
                  <TouchableOpacity onPress={() => navigation.navigate('Home2Screen')}>
                    <Text style={styles.link}>ข้อกำหนดการให้บริการ</Text>
                  </TouchableOpacity>
                  <Text style={styles.normalText}> และ </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Home3Screen')}>
                    <Text style={styles.link}>นโยบายความเป็นส่วนตัว</Text>
                  </TouchableOpacity>
                  <Text style={styles.normalText}> ของ HarnKeng</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImg: { resizeMode: 'cover' },

  safe: { flex: 1 },

  // จัดให้อยู่กึ่งกลางแนวตั้งเสมอ
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },

  // แค่จำกัดความกว้าง ไม่ใส่พื้นหลัง/กรอบขาว
  formWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },

  appBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 2,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: { color: '#050505ff', fontSize: 16, fontWeight: '700' },

  logo: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0c0c0cff',
    marginBottom: 14,
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.97)',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 251, 251, 0)', // โปร่งใสอ่านง่ายบนพื้นหลังฟ้า
    color: '#060606ff',
    marginBottom: 12,
  },

  phoneRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  pickerBox: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    backgroundColor: 'rgba(209, 200, 200, 0)',
    marginRight: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#060606ff',
  },

  hint: {
    width: '100%',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 16,
  },

  btn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  btnPrimary: { backgroundColor: 'rgba(58, 162, 58, 1)' },
  btnText: { color: '#100f0fff', fontSize: 18, fontWeight: '800' },

  centerBlock: { alignItems: 'center', marginBottom: 16 },
  normalText: { fontSize: 14, color: '#000000ff' },
  link: { fontSize: 14, color: '#107122ff', textDecorationLine: 'underline', fontWeight: '700' },

  termsRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

export default Singup3Screen;
