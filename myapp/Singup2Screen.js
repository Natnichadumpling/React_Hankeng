import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Singup2Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email = "", hashedPassword = "" } = route.params || {};

  const [name, setName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+66");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ตรวจสอบความถูกต้องของฟอร์ม
  const isFormValid = name.trim().length > 0 && phoneNumber.trim().length >= 8;

  // ตรวจสอบว่าเบอร์โทรมีตัวเลขเท่าที่จำเป็น
  const handleNext = () => {
    if (!isFormValid) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    // เปลี่ยนเส้นทางไปยังหน้าถัดไป
    navigation.navigate("Singup3Screen", {
      email,
      hashedPassword,
      name,
      phone: selectedCountryCode + phoneNumber,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("./assets/images/p.png")}
        style={styles.container}
      >
        <View style={styles.body}>
          {/* โลโก้ */}
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>สมัครใช้งาน</Text>

          {/* ชื่อผู้ใช้ */}
          <TextInput
            style={styles.input}
            placeholder="ชื่อผู้ใช้"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />

          {/* หมายเลขโทรศัพท์ */}
          <View style={styles.phoneContainer}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCountryCode}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedCountryCode(itemValue)}
              >
                <Picker.Item label="+66" value="+66" />
                <Picker.Item label="+1" value="+1" />
                <Picker.Item label="+44" value="+44" />
                <Picker.Item label="+81" value="+81" />
              </Picker>
            </View>

            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="หมายเลขโทรศัพท์"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <Text style={styles.hint}>*กรุณากรอกข้อมูลให้ครบก่อนกดถัดไป</Text>

          {/* ปุ่มถัดไป */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isFormValid ? "#4DBB9A" : "#C7C7C7" },
            ]}
            onPress={handleNext}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  body: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    height: 120,
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  logo: { width: 100, height: 100, resizeMode: "contain" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1.6,
    borderColor: "#A7C7B4",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8FFFB",
    color: "#111827",
    fontSize: 15,
    marginBottom: 14,
  },
  phoneContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  pickerContainer: {
    borderWidth: 1.6,
    borderColor: "#A7C7B4",
    borderRadius: 12,
    backgroundColor: "#F8FFFB",
    overflow: "hidden",
    marginRight: 10,
  },
  picker: { width: 100, height: 52, color: "#111827" },
  hint: {
    width: "100%",
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
    marginTop: 6,
  },
  button: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
});

export default Singup2Screen;
