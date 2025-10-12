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
import { useNavigation } from "@react-navigation/native";
import { hashPassword } from "./utils/hashPassword";

const SingupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ตรวจสอบความยาวรหัสผ่าน
  const isPasswordValid = password.length >= 8;
  // ตรวจสอบว่าอีเมลมีรูปแบบที่ถูกต้องหรือไม่
  const isEmailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(email);

  const handleNext = async () => {
    if (!email.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมล");
      return;
    }
    if (!isEmailValid) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    const hashed = await hashPassword(password);
    navigation.navigate("Singup2Screen", {
      email,
      hashedPassword: hashed,
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
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/images/logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>สมัครใช้งาน</Text>

          <TextInput
            style={styles.input}
            placeholder="ที่อยู่อีเมล"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text
            style={[styles.validationText, { color: isPasswordValid ? "green" : "#b91c1c" }]}
          >
            * ต้องมีตัวอักขระอย่างน้อย 8 ตัว
          </Text>

          {/* ปุ่มถัดไป */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isPasswordValid && isEmailValid
                  ? "rgb(67, 154, 67)"
                  : "rgba(100, 100, 100, 0.3)",
              },
            ]}
            onPress={handleNext}
            disabled={!isPasswordValid || !isEmailValid}
          >
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  body: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  logoContainer: {
    height: 120,
    width: 120,
    backgroundColor: "white",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "black",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    color: "#000",
  },
  validationText: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
    transitionDuration: "0.3s",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default SingupScreen;
