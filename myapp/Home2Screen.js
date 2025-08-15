import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Home2Screen = () => {
  const navigation = useNavigation();

  // Get screen width for dynamic font size adjustment
  const screenWidth = Dimensions.get('window').width;
  const fontSize = screenWidth > 400 ? 18 : 16; // Adjust font size based on screen width

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>ปิด</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>ข้อกำหนดการให้บริการ</Text>
      </View>

      <View style={styles.body}>
        {/* Centered Logo */}
        <Image source={require('./assets/images/logo.png')} style={styles.logo} />

        {/* Content Sections */}
        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>วัตถุประสงค์</Text>
          <Text style={[styles.text, { fontSize }]}>
            HarnKeng เป็นแอปพลิเคชันสำหรับแบ่งเงินค่าใช้จ่ายในกิจกรรมกลุ่ม เช่น ทริปกับเพื่อน การสังสรรค์ หรือกิจกรรมต่าง ๆ โดยฟังก์ชันหลัก ได้แก่:
            {'\n'}• สร้างกลุ่มกิจกรรมและเชิญเพื่อนเข้าร่วม
            {'\n'}• บันทึกการจ่าย พร้อมแบบใบเสร็จ
            {'\n'}• คำนวณยอดที่แต่ละคนต้องจ่ายโดยอัตโนมัติ (แบบหักล้าง)
            {'\n'}• สรุปรายเดือนและแจ้งเตือนรายการสำคัญ
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>การใช้งานและความรับผิดชอบของผู้ใช้</Text>
          <Text style={[styles.text, { fontSize }]}>
            ผู้ใช้ต้อง:
            {'\n'}• ให้ข้อมูลที่ถูกต้องและเป็นความจริง
            {'\n'}• ดูแลรักษาความปลอดภัยของบัญชีตนเอง
            {'\n'}• ไม่กระทำการใด ๆ ที่ทำให้ระบบเสียหาย หรือรบกวนการทำงานของผู้ใช้อื่น
            {'\n'}• ไม่ใช้แอปในทางที่ผิดกฎหมาย หรือขัดต่อจริยธรรม
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>ความเป็นส่วนตัว</Text>
          <Text style={[styles.text, { fontSize }]}>
            แอปจะไม่เก็บข้อมูลบัตรเครดิตหรือบัญชีธนาคารของผู้ใช้ข้อมูลส่วนตัว เช่น ชื่อ อีเมล และรูปภาพ จะถูกเก็บรักษาตาม [นโยบายความเป็นส่วนตัว] เพื่อวัตถุประสงค์ในการพัฒนาบริการHarnKeng จะไม่เปิดเผยข้อมูลแก่บุคคลภายนอก เว้นแต่มีเหตุจำเป็นตามกฎหมาย
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>สิทธิ์การใช้งาน</Text>
          <Text style={[styles.text, { fontSize }]}>
            ผู้ใช้ได้รับสิทธิ์ในการใช้งานแอปเพื่อ วัตถุประสงค์ส่วนตัว และ ไม่เชิงพาณิชย์เท่านั้นห้ามนำไปให้บริการแก่ผู้อื่นหรือใช้งานในลักษณะอื่นที่ไม่ได้รับอนุญาตจาก HarnKeng
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>ทรัพย์สินทางปัญญา</Text>
          <Text style={[styles.text, { fontSize }]}>
            เนื้อหา รูปภาพ ฟังก์ชัน และการออกแบบทั้งหมดในแอปนี้ เป็นทรัพย์สินของ HarnKeng ห้ามทำซ้ำ ดัดแปลง แจกจ่าย หรือใช้เพื่อวัตถุประสงค์อื่นโดยไม่ได้รับอนุญาต
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>การให้บริการและข้อจำกัดความรับผิด</Text>
          <Text style={[styles.text, { fontSize }]}>
            HarnKeng ให้บริการตาม “สภาพที่เป็นอยู่” (As-is) โดยไม่รับประกันความสมบูรณ์หรือความพร้อมของบริการทางเราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของผู้ที่ละเมิดข้อกำหนดได้โดยไม่ต้องแจ้งล่วงหน้า
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>การเชื่อมโยงภายนอก</Text>
          <Text style={[styles.text, { fontSize }]}>
            แอปอาจมีลิงก์หรือการเชื่อมต่อกับบริการของบุคคลที่สาม ซึ่งอยู่นอกเหนือการควบคุมของ HarnKeng เราไม่รับประกันความปลอดภัยหรือความถูกต้องของบริการเหล่านั้น
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>การเปลี่ยนแปลงข้อกำหนด</Text>
          <Text style={[styles.text, { fontSize }]}>
            ข้อกำหนดนี้อาจมีการเปลี่ยนแปลงได้โดยไม่ต้องแจ้งให้ทราบล่วงหน้าการใช้งานต่อหลังมีการเปลี่ยนแปลง ถือว่าท่านยอมรับข้อกำหนดฉบับใหม่โดยอัตโนมัติ
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { fontSize }]}>กฎหมายที่ใช้บังคับ</Text>
          <Text style={[styles.text, { fontSize }]}>
            ข้อกำหนดนี้อยู่ภายใต้บังคับแห่งกฎหมายของประเทศไทย หากมีข้อพิพาท ให้ยึดถือเขตอำนาจของศาลไทยเป็นหลัก
          </Text>
        </View>

      <View style={styles.contactSection}>
                <Text style={styles.contactText}>หากมีคำถามหรือข้อเสนอแนะ กรุณาติดต่อเราที่ช่องทาง</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home4Screen')}>
                  <Text style={styles.contactLink}>[ติดต่อเรา]</Text>
                </TouchableOpacity>
                <Text style={styles.contactText}> ภายในแอป</Text>
              </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  appBar: {
    backgroundColor: '#7AD5CC',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    flex: 1,
  },
  body: {
    padding: 16,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  heading: {
    fontWeight: 'bold',
    color: 'black',
  },
  text: {
    color: 'black',
  },
    contactSection: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, 
  },
  contactLink: {
    color: '#2B8A20',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginHorizontal: 4, 
  },

});

export default Home2Screen;
