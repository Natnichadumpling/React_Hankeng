import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "./supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    // ตรวจสอบว่าอีเมลมี @ และ . หรือไม่
    return email.includes('@') && email.includes('.');
  };

  const handleLogin = async () => {
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!email || !password) {
      global.alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    
    // ตรวจสอบรูปแบบอีเมล
    if (!validateEmail(email)) {
      global.alert("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    
    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 8) {
      global.alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    
    try {
      // ค้นหาผู้ใช้ในฐานข้อมูลด้วยอีเมลเท่านั้น
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      // ตรวจสอบ error จากฐานข้อมูล
      if (error) {
        console.error("Database error:", error);
        setLoading(false);
        global.alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
        return;
      }

      // ตรวจสอบว่าพบผู้ใช้หรือไม่
      if (!data || data.length === 0) {
        setLoading(false);
        global.alert("ไม่พบผู้ใช้นี้ในระบบ\nกรุณาตรวจสอบอีเมลอีกครั้ง");
        return;
      }

      const userData = data[0];
      const storedPassword = userData.password;
      
      // แปลงรหัสผ่านที่ผู้ใช้กรอกเป็น SHA-256
      const sha256Hash = CryptoJS.SHA256(password).toString();
      
      console.log("=== Password Comparison ===");
      console.log("Input password:", password);
      console.log("SHA256 of input:", sha256Hash);
      console.log("Stored password:", storedPassword);
      console.log("Match:", sha256Hash === storedPassword);

      setLoading(false);

      // เปรียบเทียบ SHA-256 hash
      if (sha256Hash !== storedPassword) {
        global.alert("รหัสผ่านไม่ถูกต้อง\nกรุณาลองใหม่อีกครั้ง");
        return;
      }

      // เข้าสู่ระบบสำเร็จ
      console.log("✅ เข้าสู่ระบบสำเร็จ!");
      console.log("ข้อมูลผู้ใช้:", userData);

      try {
        // บันทึกข้อมูลผู้ใช้ใน AsyncStorage
        await AsyncStorage.setItem("userEmail", userData.email);
        await AsyncStorage.setItem("userName", userData.name);
        console.log("บันทึกข้อมูลผู้ใช้ใน AsyncStorage สำเร็จ");
      } catch (storageError) {
        console.error("ไม่สามารถบันทึกข้อมูลผู้ใช้ใน AsyncStorage:", storageError);
      }

      // นำทางไปหน้า PageScreen พร้อมส่งข้อมูลผู้ใช้
      navigation.navigate("PageScreen", {
        userData: {
          name: userData.name,
          email: userData.email,
        },
      });
      
    } catch (err) {
      setLoading(false);
      console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", err);
      global.alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ\nกรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <ImageBackground
      source={require("./assets/images/p.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>เข้าสู่ระบบ</Text>
          
          {/* ช่องกรอกอีเมล */}
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="ที่อยู่อีเมล"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          {/* ช่องกรอกรหัสผ่าน พร้อมปุ่มแสดง/ซ่อนรหัสผ่าน */}
          <View style={[styles.passwordRow, { marginBottom: 12 }]}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="รหัสผ่าน"
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.6}
            >
              <Text style={styles.cuteEyeEmoji}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* ข้อความแจ้งเตือนความยาวรหัสผ่าน */}
          <Text style={styles.validationText}>
            *ต้องมีตัวอักขระอย่างน้อย 8 ตัว
          </Text>
          
          {/* ปุ่มเข้าสู่ระบบ */}
          <TouchableOpacity
            testID="loginButton"
            style={[
              styles.button,
              { backgroundColor: "rgb(67, 154, 67)", marginBottom: 18 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
            )}
          </TouchableOpacity>
          
          {/* ลิงก์ลืมรหัสผ่าน */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0,
    minHeight: "100%",
  },
  body: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  logoContainer: {
    height: 120,
    width: 120,
    backgroundColor: "white",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "black",
    textAlign: "center",
  },
  input: {
    width: "100%",
    minWidth: 180,
    maxWidth: 320,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 180,
    maxWidth: 320,
    marginBottom: 8,
  },
  eyeButton: {
    position: "absolute",
    right: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cuteEyeEmoji: {
    fontSize: 16,
    textAlign: "center",
  },
  validationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#232323",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    width: "100%",
    minWidth: 180,
    maxWidth: 320,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  forgotPasswordText: {
    color: "rgb(2, 99, 53)",
    fontSize: 15,
    textDecorationLine: "underline",
    marginTop: 8,
    alignSelf: "center",
  },
});

export default LoginScreen;