import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Home3Screen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>นโยบายความเป็นส่วนตัว</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.logoContainer}>
          <Image
            source={require("./assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.text}>
          HarnKeng ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน{"\n"}
          เราขอแจ้งให้ท่านทราบถึงวิธีที่เราเก็บ ใช้{"\n"}
          และคุ้มครองข้อมูลส่วนตัวของท่าน ตามรายละเอียดต่อไปนี้
        </Text>

        <Text style={styles.title}>ข้อมูลที่เราเก็บรวบรวม</Text>
        <Text style={styles.bodyText}>
          ข้อมูลที่ผู้ใช้ให้โดยตรง:{"\n"}• ชื่อ-นามสกุล{"\n"}• อีเมล{"\n"}•
          เบอร์โทรศัพท์{"\n"}• รูปโปรไฟล์{"\n"}• ข้อมูลกิจกรรมต่าง ๆ ภายในแอป
          {"\n"}• ใบเสร็จรับเงิน / สลิปโอนเงิน{"\n"}
          {"\n"}
          ข้อมูลที่เราเก็บโดยอัตโนมัติ:{"\n"}• วันเวลาในการเข้าใช้งาน{"\n"}•
          ข้อมูลอุปกรณ์ เช่น ประเภทระบบปฏิบัติการและเบราว์เซอร์{"\n"}•
          เราไม่เก็บข้อมูลบัตรเครดิตหรือบัญชีธนาคาร
        </Text>

        <Text style={styles.title}>วัตถุประสงค์ในการใช้ข้อมูล</Text>
        <Text style={styles.bodyText}>
          เราใช้ข้อมูลของท่านเพื่อ:{"\n"}• จัดการกลุ่มและรายการค่าใช้จ่าย{"\n"}•
          คำนวณยอดเงินและหนี้คงค้าง{"\n"}• ส่งการแจ้งเตือน{"\n"}•
          พัฒนาปรับปรุงแอปและประสบการณ์ผู้ใช้งาน{"\n"}•
          ตรวจสอบความปลอดภัยของระบบและบัญชี
        </Text>

        <Text style={styles.title}>การเปิดเผยข้อมูล</Text>
        <Text style={styles.bodyText}>
          • ข้อมูลการใช้จ่าย จะแชร์ให้เฉพาะสมาชิกในกลุ่มเดียวกันเท่านั้น{"\n"}•
          เราไม่เปิดเผยข้อมูลส่วนตัวแก่บุคคลภายนอก เว้นแต่:
          เป็นไปตามกฎหมายเพื่อป้องกันอันตรายหรือรักษาความปลอดภัยของระบบและผู้ใช้
        </Text>

        <Text style={styles.title}>ระยะเวลาการจัดเก็บข้อมูล</Text>
        <Text style={styles.bodyText}>
          • ข้อมูลบัญชี: เก็บตลอดระยะเวลาการใช้งาน{"\n"}• ข้อมูลกิจกรรม: เก็บไว้
          3 ปี{"\n"}• ข้อมูลการเงิน: เก็บไว้ 5 ปี{"\n"}
          เราใช้การเข้ารหัสและมาตรการรักษาความปลอดภัยมาตรฐาน เช่น HTTPS
          และการยืนยันตัวตนสองชั้น
        </Text>

        <Text style={styles.title}>สิทธิของผู้ใช้งาน</Text>
        <Text style={styles.bodyText}>
          ผู้ใช้มีสิทธิ์:{"\n"}• เข้าถึง แก้ไข หรือลบข้อมูลส่วนตัวของตน{"\n"}•
          ถอนความยินยอมในการเก็บข้อมูล{"\n"}•
          ขอรับสำเนาข้อมูลของตนในรูปแบบดิจิทัล ท่านสามารถดำเนินการได้ผ่านเมนู
          "จัดการข้อมูลส่วนตัว" ภายในแอป
        </Text>

        <Text style={styles.title}>คุกกี้ (Cookies)</Text>
        <Text style={styles.bodyText}>
          • เราใช้คุกกี้เพื่อจดจำการตั้งค่าและปรับปรุงประสบการณ์การใช้งาน{"\n"}•
          ผู้ใช้สามารถจัดการหรือปิดการใช้คุกกี้ได้ในเมนูการตั้งค่าของแอป
        </Text>

        <Text style={styles.title}>การถ่ายโอนข้อมูลไปต่างประเทศ</Text>
        <Text style={styles.bodyText}>
          ข้อมูลของท่านอาจถูกจัดเก็บหรือประมวลผลในต่างประเทศ โดยอยู่ภายใต้
          มาตรฐานความปลอดภัยสากล
        </Text>

        <Text style={styles.title}>การเปลี่ยนแปลงนโยบาย</Text>
        <Text style={styles.bodyText}>
          นโยบายความเป็นส่วนตัวนี้อาจมีการเปลี่ยนแปลงเป็นครั้งคราว
          เราจะแจ้งให้ทราบล่วงหน้าอย่างน้อย 30 วัน{"\n"}
          ผ่านแอปหรือช่องทางที่เหมาะสม
        </Text>

        <Text style={styles.contactHeader}>ช่องทางติดต่อ</Text>
        <Text style={styles.bodyText2}>
          หากมีข้อสงสัย ร้องเรียน หรือขอใช้สิทธิต่าง ๆ กรุณาติดต่อ:{"\n"}
          ทีมงาน HarnKeng{"\n"}
          📧 อีเมล: support@harnkeng.app
        </Text>

        <View style={styles.contactSection}>
          <Text style={styles.contactText}>📱 ผ่านเมนู </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home4Screen")}>
            <Text style={styles.contactLink}>[ติดต่อเรา]</Text>
          </TouchableOpacity>
          <Text style={styles.contactText}> ภายในแอป</Text>
        </View>

        <View style={styles.spacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  appBar: {
    backgroundColor: "#7AD5CC",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    flex: 1,
  },
  body: {
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
  },
  bodyText2: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 16,
  },
  contactLink: {
    fontSize: 16,
    color: "#2B8A20",
    textDecorationLine: "underline",
  },
  contactSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  spacer: {
    marginBottom: 30,
  },
});

export default Home3Screen;
