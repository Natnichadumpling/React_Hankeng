import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, ImageBackground } from 'react-native';

const features = [
  { icon: require('./assets/images/logo.png'), text: 'ค้นหาค่าใช้จ่าย' },
  { icon: require('./assets/images/logo.png'), text: 'หารกลุ่มได้ไม่จำกัด' },
  { icon: require('./assets/images/logo.png'), text: 'แนบรูปภาพและใบเสร็จ' },
  { icon: require('./assets/images/logo.png'), text: 'การแปลงสกุลเงิน' },
  { icon: require('./assets/images/logo.png'), text: 'แปลภาษา' },
  { icon: require('./assets/images/logo.png'), text: 'พร้อมสิ่งดีๆ อีกมากมายในอนาคต!' },
];

const ProScreen = ({ navigation }) => {
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
            <Text style={styles.headerTitle}>HarnKeng Pro</Text>
          </View>

          {/* Pro Section */}
          <View style={styles.proSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.upgradeText}>อัปเกรดเป็น </Text>
              <Text style={styles.proText}>HarnKeng Pro</Text>
              <Image source={require('./assets/images/logo.png')} style={styles.diamondIcon} />
            </View>
            {/* Features */}
            {features.map((item, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Image source={item.icon} style={styles.featureIcon} />
                <Text style={styles.featureText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
            <TouchableOpacity style={styles.priceBtn}>
              <Text style={styles.priceBtnText}>THB1490 / ปี</Text>
            </TouchableOpacity>
            <Text style={styles.discountText}>ประหยัด THB898 / ปี</Text>
            <Text style={styles.orText}>หรือ</Text>
            <TouchableOpacity style={styles.priceBtn}>
              <Text style={styles.priceBtnText}>THB199 / เดือน</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refundBtn}>
              <Text style={styles.refundBtnText}>เริ่มคืนรายการที่ซื้อ</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>เลือกวิธีชำระเงินที่คุณต้องการ</Text>
            <Text style={styles.footerSubText}>
              เรียกเก็บเงินซ้ำตามระยะเวลาที่กำหนด ยกเลิกได้ตลอดเวลา{'\n'}
              <TouchableOpacity onPress={() => navigation.navigate('Home2Screen')}>
                <Text style={styles.linkText}>ข้อกำหนดการให้บริการ</Text>
              </TouchableOpacity>
              {' และ '}
              <TouchableOpacity onPress={() => navigation.navigate('Home3Screen')}>
                <Text style={styles.linkText}>นโยบายความเป็นส่วนตัว</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

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
    paddingHorizontal: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginRight: 32, // for centering
  },
  proSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    marginBottom: 28,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  upgradeText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },
  proText: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
    marginLeft: 2,
    marginRight: 2,
  },
  diamondIcon: {
    width: 20,
    height: 20,
    marginLeft: 2,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  featureIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: '#1976d2',
  },
  featureText: {
    fontSize: 15,
    color: '#333',
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceBtn: {
    backgroundColor: '#e6f0f3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  priceBtnText: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 15,
    color: '#ff6347',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orText: {
    fontSize: 16,
    color: '#222',
    marginVertical: 8,
  },
  refundBtn: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  refundBtnText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  footerSubText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  linkText: {
    fontSize: 12,
    color: '#22c55e', // Green color for the links
    fontWeight: 'bold',
  },
});

export default ProScreen;
