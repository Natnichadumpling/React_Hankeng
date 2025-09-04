import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, ScrollView, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Home4Screen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeText}>❌</Text>
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>ช่องทางการติดต่อเรา</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* โลโก้ */}
          <View style={styles.logoContainer}>
            <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          </View>

          {/* ข้อความต้อนรับ */}
          <Text style={styles.text}>
            ติดต่อเรา{'\n'}
            หากคุณมีคำถาม ข้อเสนอแนะ หรือพบปัญหาในการใช้งาน กรุณาติดต่อทีมงานผ่านช่องทางด้านล่างนี้
          </Text>

          {/* ข้อมูลติดต่อ */}
          <Text style={styles.title}>ข้อมูลติดต่อ</Text>
          <Text style={styles.bodyText}>
            HarnKeng (หารเก่ง){'\n'}
            อาคารนวัตกรรม มหาวิทยาลัยเทคโนโลยีสุรนารี{'\n'}
            อ.เมือง จ.นครราชสีมา 30000{'\n'}
            โทร: 098-xxx-xxxx{'\n'}
            อีเมล: support@harnkeng.app{'\n'}
            เวลาทำการ: จันทร์ - ศุกร์ เวลา 09:00 - 17:00 น.
          </Text>

          {/* ช่องทางอื่นๆ */}
          <Text style={styles.title}>ช่องทางอื่นๆ</Text>
          <Text style={styles.bodyText}>
            Instagram: @harnkeng_official{'\n'}
            Line: @harnkeng{'\n'}
            Facebook: @harnkeng.official
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
  },
  appBar: {
    backgroundColor: '#7AD5CC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButton: {
    marginRight: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 28, // เพื่อบาลานซ์กับปุ่มปิด
  },
  body: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#2c5aa0',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});

export default Home4Screen;