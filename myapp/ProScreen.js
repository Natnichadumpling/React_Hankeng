import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, TextInput, ScrollView, ImageBackground } from 'react-native';

const ProScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('./assets/images/p1.png')} // Set the background image
      style={styles.backgroundImage} // Apply the image to the background
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>HarnKeng Pro</Text>
          </View>

            <View style={styles.subscriptionSection}>
            {/* <Image source={require('./assets/images/logo.png')} style={styles.planImage} /> */}
            <Text style={styles.planTitle}>อัปเกรดเป็น</Text>
            <Text style={styles.planTitle}>HarnKeng Pro</Text>
            <Text style={styles.featuresText}>
              ค้นหาค่าใช้จ่าย
              {"\n"}
              หารกลุ่มได้ไม่จำกัด
              {"\n"}
              แนบรูปภาพและใบเสร็จ
              {"\n"}
              การแปลงสกุลเงิน
              {"\n"}
              แปลภาษา
              {"\n"}
              พร้อมสิ่งดีๆ อีกมากมายในอนาคต!
            </Text>
          </View>

          {/* Pricing Section */}
          <View style={styles.pricingSection}>
          <Text style={styles.priceText}>THB1490 / ปี</Text>
          <Text style={styles.discountPriceText}>ประหยัด THB898 / ปี</Text>
          <Text style={styles.orText}>หรือ</Text>
          <Text style={styles.priceText}>THB199 / เดือน</Text>
          <Text style={styles.footerText}>เริ่มคืนรายการที่ซื้อ</Text>
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
    paddingTop: 20,
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
  backgroundColor: 'transparent', // Ensure background is fully transparent
  padding: 20,
  borderRadius: 10,
  elevation: 3,
  marginBottom: 30,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
   priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderWidth: 2,
    borderColor: '#007BFF', // Blue border color
    borderRadius: 8,
    padding: 10, // Add padding inside the border
    textAlign: 'center', // Optional, to center the text
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
  planImage: {
  width: '100%',
  height: 150,  // Adjust this value as needed
  marginBottom: 15,
},
});

export default ProScreen;
