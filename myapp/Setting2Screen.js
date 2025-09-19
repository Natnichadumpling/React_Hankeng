import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, ImageBackground } from 'react-native';

const Setting2Screen = ({ navigation }) => {
  // State สำหรับ radio group
  const [groupJoin, setGroupJoin] = useState('join');
  const [expense, setExpense] = useState([]); // ใช้เป็น array เพื่อเลือกได้หลายตัว
  const [other, setOther] = useState('summary');

  // ฟังก์ชันสำหรับ toggle ค่าใช้จ่าย
  const toggleExpense = (value) => {
    setExpense(prevExpense => 
      prevExpense.includes(value) 
        ? prevExpense.filter(item => item !== value) // ลบค่าออกถ้าเลือกแล้ว
        : [...prevExpense, value] // เพิ่มค่าเข้าไปถ้าไม่เลือก
    );
  };

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>การตั้งค่าการแจ้งเตือน</Text>
          </View>

          {/* กลุ่ม */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>กลุ่ม/สมาชิก</Text>
            <RadioItem
              label="เมื่อคนเพิ่มฉันไปยังกลุ่ม"
              selected={groupJoin === 'join'}
              onPress={() => setGroupJoin('join')}
            />
            <RadioItem
              label="เมื่อมีคนลบฉันออกจากกลุ่ม"
              selected={groupJoin === 'leave'}
              onPress={() => setGroupJoin('leave')}
            />
          </View>

          {/* ค่าใช้จ่าย */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ค่าใช้จ่าย</Text>
            <RadioItem
              label="เมื่อมีการเพิ่มค่าใช้จ่าย"
              selected={expense.includes('add')}
              onPress={() => toggleExpense('add')}
            />
            <RadioItem
              label="เมื่อมีการแก้ไข/ลบค่าใช้จ่าย"
              selected={expense.includes('edit')}
              onPress={() => toggleExpense('edit')}
            />
            <RadioItem
              label="เมื่อมีคนแสดงความคิดเห็นกับค่าใช้จ่าย"
              selected={expense.includes('comment')}
              onPress={() => toggleExpense('comment')}
            />
            <RadioItem
              label="เมื่อมีใครชำระค่าใช้จ่ายครบ"
              selected={expense.includes('paid')}
              onPress={() => toggleExpense('paid')}
            />
            <RadioItem
              label="เมื่อถึงวันครบกำหนดชำระ"
              selected={expense.includes('due')}
              onPress={() => toggleExpense('due')}
            />
          </View>

          {/* ประเภทอื่นๆ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ประเภทอื่นๆ</Text>
            <RadioItem
              label="สรุปกิจกรรมของแต่ละรอบเดือน"
              selected={other === 'summary'}
              onPress={() => setOther('summary')}
            />
            <RadioItem
              label="ข่าวสารและอัปเดตสำคัญของ HarnKeng"
              selected={other === 'news'}
              onPress={() => setOther('news')}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
          </TouchableOpacity>

          {/* Coin Image */}
          <View style={styles.coinContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.coinImage} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// Radio Button Item
const RadioItem = ({ label, selected, onPress }) => (
  <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingBottom: 30,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  backText: {
    fontSize: 26,
    color: '#222',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#b3c6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#f7fafd',
  },
  radioOuterSelected: {
    borderColor: '#4a90e2',
    backgroundColor: '#eaf4fb',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4a90e2',
  },
  radioLabel: {
    fontSize: 15,
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#218a53',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  coinContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  coinImage: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    opacity: 0.9,
  },
});

export default Setting2Screen;
