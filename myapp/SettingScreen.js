import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient'; // Assuming supabaseClient is where you initialize Supabase

const SettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // state for select simple currency
  const [currency, setCurrency] = useState('THB');
  const [language, setLanguage] = useState('ภาษาไทย');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [slipName, setSlipName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [hasSession, setHasSession] = useState(true);
  const isActiveRef = React.useRef(true);

  // ฟังก์ชันดึงข้อมูลผู้ใช้จาก Supabase
  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;
      if (!userEmail) {
        if (isActiveRef.current) setHasSession(false);
        setSlipName('Guest User');
        setEmail('guest@example.com');
        setPhone('');
        setPassword('');
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, password')
        .eq('email', userEmail)
        .single();
      if (error || !data) {
        if (isActiveRef.current) setHasSession(false);
        setSlipName('Guest User');
        setEmail(userEmail);
        setPhone('');
        setPassword('');
        return;
      }
      if (isActiveRef.current && data) {
        setSlipName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setPassword(data.password || '');
        setHasSession(true);
      }
    } catch (e) {
      if (isActiveRef.current) setHasSession(false);
      setSlipName('Guest User');
      setEmail('guest@example.com');
      setPhone('');
      setPassword('');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      isActiveRef.current = true;
      fetchUser();
      return () => {
        isActiveRef.current = false;
      };
    }, [route])
  );

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerWrap}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backIcon}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>การตั้งค่าบัญชี</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          {/* ถ้าไม่มี session ให้แจ้งเตือนและแสดงปุ่ม login */}
          {!hasSession ? (
            <View style={{ margin: 24, alignItems: 'center' }}>
              <Text style={{ color: 'red', fontSize: 16, marginBottom: 12 }}>
                กรุณาเข้าสู่ระบบก่อนใช้งาน
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#22c55e', padding: 12, borderRadius: 8 }}
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.profileSection}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  <Image
                    source={require('./assets/images/logo.png')}
                    style={styles.avatar}
                  />
                )}
                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.changePhotoText}>เลือกภาพจากไฟล์</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto}>
                  <Text style={styles.changePhotoText}>ถ่ายภาพใหม่</Text>
                </TouchableOpacity>
              </View>

              {/* Info fields */}
              <View style={styles.formCard}>
                {/* ชื่อ (แก้ไขได้) */}
                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>ชื่อ</Text>
                    <TextInput
                      style={styles.fieldValue}
                      value={slipName}
                      onChangeText={setSlipName}
                    />
                  </View>
                </View>
                {/* อีเมล */}
                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>ที่อยู่อีเมล</Text>
                    <Text style={styles.fieldValue}>{email}</Text>
                  </View>
                </View>
                {/* เบอร์โทร */}
                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>หมายเลขโทรศัพท์</Text>
                    <Text style={styles.fieldValue}>{phone}</Text>
                  </View>
                </View>
                {/* รหัสผ่าน (toggle visibility) */}
                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>รหัสผ่าน</Text>
                    <TextInput
                      style={styles.fieldValue}
                      value={password}
                      secureTextEntry={!showPassword}
                      editable={false}
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                    <Text style={styles.editText}>{showPassword ? 'ซ่อน' : 'แสดง'}</Text>
                  </TouchableOpacity>
                </View>
                {/* Selects */}
                <View style={styles.fieldRow}>
                  <Select
                    label="สกุลเงินเริ่มต้น"
                    value={currency}
                    onPress={() => setShowCurrencyModal(true)}
                  />
                </View>
              </View>

              {/* Save button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Currency selection modal */}
        <Modal visible={showCurrencyModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เลือกสกุลเงิน</Text>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleCurrencySelect('THB')}>
                <Text style={styles.modalOptionText}>THB</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handleCurrencySelect('USD')}>
                <Text style={styles.modalOptionText}>USD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

/* ====== Small components ====== */
const Field = ({ label, value, editable, onEdit }) => (
  <View style={styles.fieldRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.fieldValue}
          value={value}
          onChangeText={onEdit}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
    {editable && (
      <TouchableOpacity>
        <Text style={styles.editText}>แก้ไข</Text>
      </TouchableOpacity>
    )}
  </View>
);

const Select = ({ label, value, onPress }) => {
  return (
    <View style={styles.selectWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBox} onPress={onPress}>
        <Text style={styles.selectText}>{value}</Text>
        <Text style={styles.selectChevron}>▾</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ====== Styles ====== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrap: {
    backgroundColor: 'rgba(203, 229, 232, 0.9)',
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#2c2c2c',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: 'contain',
    backgroundColor: '#fdecec',
  },
  changePhotoText: {
    marginTop: 8,
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: 'rgba(232, 244, 248, 0.9)',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  editText: {
    color: '#10b981',
    marginTop: 18,
    marginLeft: 8,
  },
  selectWrap: {
    marginTop: 8,
    marginBottom: 12,
  },
  selectBox: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: '#111827',
  },
  selectChevron: {
    fontSize: 18,
    color: '#6b7280',
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    marginHorizontal: 16,
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancelButton: {
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default SettingScreen;