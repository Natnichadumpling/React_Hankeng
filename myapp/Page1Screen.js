import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Page1Screen = ({ route }) => {
  const navigation = useNavigation();
  const email = route?.params?.email;

  return (
    <ImageBackground
      source={require('./assets/images/p2.png')}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        
        {/* Logo + App Name */}
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>HarnKeng</Text>
        </View>

        {/* Slogan */}
        <Text style={styles.slogan}>
          จัด จ่าย จด{"\n"}
          <Text style={{ color: '#1E3A8A', fontWeight: 'bold' }}>ทำทั้งหมดจบในที่เดียว</Text>
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          HarnKeng เก็บประวัติในรูปแบบของ Chat อ่านง่าย{"\n"}
          สามารถติดตามยอดใช้จ่ายสบาย{"\n"}
          ไม่ต้องคอยอัพเดตในรายรับ รายจ่ายแยกต่างหาก
        </Text>

        {/* Transaction Box */}
        <View style={styles.card}>
          {/* Item 1 */}
          <View style={styles.chatRow}>
            <Image source={require('./assets/images/i.png')} style={styles.chatImage} />
            <View style={styles.chatBubble}>
              <Text style={styles.chatTitle}>ร้านอาหาร</Text>
              <View style={styles.chatContent}>
                <Image source={require('./assets/images/food.png')} style={styles.chatPic} />
                {/* <Image source={require('./assets/images/receipt.png')} style={styles.chatPic} /> */}
              </View>
              <View style={styles.chatFooter}>
                <Text style={styles.chatAction}>รับโอนเงิน</Text>
                <Text style={styles.chatAmount}>+ 1000.00</Text>
              </View>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.chatRow}>
            <View style={[styles.chatBubble, { alignSelf: 'flex-end' }]}>
              <Text style={styles.chatTitle}>โอนเงิน</Text>
              <View style={styles.chatContent}>
                {/* <Image source={require('./assets/images/receipt.png')} style={styles.chatPic} /> */}
              </View>
              <View style={styles.chatFooter}>
                <Text style={styles.chatAction}>โอนเงิน</Text>
                <Text style={styles.chatAmount}>+ 250.00</Text>
              </View>
            </View>
            <Image source={require('./assets/images/i.png')} style={styles.chatImage} />
          </View>
        </View>

        {/* Finish Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Page2Screen', { email })}
        >
          <Text style={styles.buttonText}>เสร็จสิ้น</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: { alignItems: 'center', marginTop: 20 },
  logo: { width: 120, height: 120, resizeMode: 'contain' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#1E3A8A', marginTop: 10 },
  slogan: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 30,
    elevation: 5,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  chatImage: { width: 40, height: 40, borderRadius: 20 },
  chatBubble: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 10,
  },
  chatTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  chatContent: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  chatPic: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatAction: { fontSize: 14, fontWeight: '600', color: '#444' },
  chatAmount: { fontSize: 14, fontWeight: 'bold', color: '#16A34A' },
  button: {
    width: 200,
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 4,
  },
  buttonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
});

export default Page1Screen;
