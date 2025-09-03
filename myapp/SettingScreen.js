import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingScreen = () => {
  const navigation = useNavigation();

  // state สำหรับ select แบบง่าย
  const [currency, setCurrency] = useState('THB');
  const [language, setLanguage] = useState('ภาษาไทย');

  return (
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

        {/* Profile */}
        <View style={styles.profileSection}>
          <Image
            source={require('./assets/images/logo.png')}
            style={styles.avatar}
          />
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>เปลี่ยนภาพโปรไฟล์</Text>
          </TouchableOpacity>
        </View>

        {/* Info fields */}
        <View style={styles.formCard}>
          <Field
            label="ชื่อบนสลิป"
            value="Sopitnapa"
          />
          <Field
            label="ที่อยู่อีเมล"
            value="film0936123963@gmail.com"
          />
          <Field
            label="หมายเลขโทรศัพท์"
            value="0987654321"
          />
          <Field
            label="รหัสผ่าน"
            value="********"
          />

          {/* Selects */}
          <Select
            label="สกุลเงินเริ่มต้น"
            value={currency}
            onPress={() => {}}
          />
          <Select
            label="ภาษา (สำหรับเมนูและการแจ้งเตือน)"
            value={language}
            onPress={() => {}}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={() => {}}>
          <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

/* ====== Small components ====== */
const Field = ({ label, value }) => {
  return (
    <View style={styles.fieldRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.editText}>แก้ไข</Text>
      </TouchableOpacity>
    </View>
  );
};

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

  /* Header zone (แถบฟ้าอ่อนด้านบน) */
  headerWrap: {
    backgroundColor: 'rgba(203, 229, 232, 0.9)', // ฟ้าอ่อนคล้ายในภาพ
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

  /* Profile */
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

  /* Card/form */
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
    color: '#10b981', // เขียวมิ้นต์คล้าย "แก้ไข" ในภาพ
    marginTop: 18,
    marginLeft: 8,
  },

  /* Select */
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

  /* Save button */
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
});

export default SettingScreen;
