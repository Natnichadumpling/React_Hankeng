import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, TextInput, ScrollView } from 'react-native';

const ProScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HarnKeng Pro</Text>
        </View>

        {/* Subscription Plan Section */}
        <View style={styles.subscriptionSection}>
          <Text style={styles.planTitle}>อัปเกรดเป็น HarnKeng Pro</Text>
          <Text style={styles.featuresText}>
            ค้นหาสินค้าได้ง่าย
            {"\n"}
            หากค้นหาไม่ได้ก็ทำ
            {"\n"}
            แสดงรูปภาพและใบเสร็จ
            {"\n"}
            การแปลงสกุลเงิน
            {"\n"}
            แฟลชการ์ด
            {"\n"}
            พร้อมส่งสิ่งที่มีมากมายในภายหลัง!
          </Text>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.priceText}>THB1490 / ปี</Text>
          <Text style={styles.discountPriceText}>ประหยัด THB898 / ปี</Text>
          <Text style={styles.orText}>หรือ</Text>
          <Text style={styles.priceText}>THB199 / เดือน</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.purchaseButton}>
          <Text style={styles.purchaseButtonText}>เริ่มต้นการสมัครสมาชิก</Text>
        </TouchableOpacity>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>เลือกวิธีการชำระเงินที่คุณต้องการ</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f4f6f9',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  subscriptionSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuresText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  pricingSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  discountPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6347',
    marginTop: 5,
  },
  orText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ProScreen;
