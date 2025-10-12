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
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "./supabaseClient"; // ✅ ต้องมี client ของคุณอยู่แล้ว

const Signup3Screen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // รับค่าจากหน้าก่อนหน้า
  const { email, hashedPassword, name, phone } = route.params || {};

  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [showList, setShowList] = useState(false);

  const BANKS = [
    { id: "kbank", name: "กสิกรไทย", logo: require("./assets/images/kbank.png") },
    { id: "scb", name: "ไทยพาณิชย์", logo: require("./assets/images/scb.png") },
    { id: "ktb", name: "กรุงไทย", logo: require("./assets/images/ktb.png") },
  ];

  const handleSave = async () => {
    if (!selectedBank) return Alert.alert("กรุณาเลือกธนาคาร");
    if (!accountNumber.trim()) return Alert.alert("กรุณากรอกเลขบัญชี");
    if (!email) return Alert.alert("ไม่พบข้อมูลอีเมลจากขั้นตอนก่อนหน้า");

    // ตรวจสอบว่าผู้ใช้มีในระบบหรือไม่
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Error checking existing user:", userError);
      return Alert.alert("เกิดข้อผิดพลาด", userError.message);
    }

    if (!existingUser) {
      // ถ้ายังไม่มีผู้ใช้ → INSERT ผู้ใช้ใหม่ทั้งหมด
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            password: hashedPassword,
            name,
            phone,
            bank_name: selectedBank,
            bank_account: accountNumber.trim(),
          },
        ]);

      if (insertError) {
        console.error("Error inserting new user:", insertError);
        return Alert.alert("ไม่สามารถสมัครสมาชิกได้", insertError.message);
      }
    } else {
      // ถ้ามีแล้ว → อัปเดตข้อมูลบัญชีธนาคาร
      const { error: updateError } = await supabase
        .from("users")
        .update({
          bank_name: selectedBank,
          bank_account: accountNumber.trim(),
        })
        .eq("email", email);

      if (updateError) {
        console.error("Error updating bank info:", updateError);
        return Alert.alert("ไม่สามารถอัปเดตข้อมูลบัญชีได้", updateError.message);
      }
    }

    // ✅ แจ้งเตือนแล้วกลับไปหน้า HomeScreen เพื่อให้เข้าสู่ระบบใหม่
    Alert.alert(
      "สำเร็จ",
      "สมัครสมาชิกเรียบร้อยแล้ว! โปรดเข้าสู่ระบบใหม่อีกครั้ง",
      [{ text: "ตกลง", onPress: () => navigation.navigate("HomeScreen") }]
    );
  };

  return (
    <ImageBackground
      source={require("./assets/images/p.png")}
      style={styles.bg}
      imageStyle={styles.bgImg}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formWrap}>
              <Image
                source={require("./assets/images/logo.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>เพิ่มบัญชีธนาคาร</Text>

              {/* เลือกธนาคาร */}
              <Text style={styles.label}>เลือกธนาคาร</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowList(!showList)}
              >
                {selectedBank ? (
                  <View style={styles.bankRow}>
                    <Image
                      source={BANKS.find((b) => b.id === selectedBank)?.logo}
                      style={styles.bankLogo}
                    />
                    <Text style={styles.bankText}>
                      {BANKS.find((b) => b.id === selectedBank)?.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholder}>เลือกธนาคาร</Text>
                )}
              </TouchableOpacity>

              {showList && (
                <View style={styles.dropdownList}>
                  {BANKS.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      style={[
                        styles.dropdownItem,
                        selectedBank === bank.id && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedBank(bank.id);
                        setShowList(false);
                      }}
                    >
                      <View style={styles.bankRow}>
                        <Image source={bank.logo} style={styles.bankLogo} />
                        <Text
                          style={[
                            styles.bankText,
                            selectedBank === bank.id && styles.bankTextSelected,
                          ]}
                        >
                          {bank.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* เลขบัญชี */}
              <Text style={styles.label}>เลขบัญชี</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น 123-456-7890"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholderTextColor="#777"
              />
              <Text style={styles.hint}>*กรุณากรอกเลขบัญชีให้ถูกต้อง</Text>

              {/* ปุ่มบันทึก */}
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.btnText}>บันทึกบัญชีธนาคาร</Text>
              </TouchableOpacity>

              {/* เงื่อนไข / นโยบาย */}
              <View style={styles.centerBlock}>
                <Text style={styles.normalText}>
                  การดำเนินการนี้ถือว่าคุณยอมรับ
                </Text>
                <View style={styles.termsRow}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Home2Screen")}
                  >
                    <Text style={styles.linkGreen}>ข้อกำหนดการให้บริการ</Text>
                  </TouchableOpacity>
                  <Text style={styles.normalText}> และ </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Home3Screen")}
                  >
                    <Text style={styles.linkGreen}>นโยบายความเป็นส่วนตัว</Text>
                  </TouchableOpacity>
                  <Text style={styles.normalText}> ของ HarnKeng</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

/* ---- styles ---- */
const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImg: { resizeMode: "cover" },
  safe: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
  },
  formWrap: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#004F3D",
    marginBottom: 22,
  },
  label: {
    alignSelf: "flex-start",
    color: "#065F46",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
  },
  dropdown: {
    width: "100%",
    height: 52,
    borderWidth: 1.6,
    borderColor: "#A7C7B4",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FFFB",
    justifyContent: "center",
    marginBottom: 10,
  },
  dropdownList: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: "#A7C7B4",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dropdownItemSelected: { backgroundColor: "#E0F2FE" },
  bankRow: { flexDirection: "row", alignItems: "center" },
  bankLogo: { width: 28, height: 28, marginRight: 10, resizeMode: "contain" },
  bankText: { fontSize: 15, color: "#0F172A" },
  bankTextSelected: { fontWeight: "700", color: "#0369A1" },
  placeholder: { fontSize: 15, color: "#9CA3AF" },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1.6,
    borderColor: "#A7C7B4",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FFFB",
    color: "#0C0C0C",
  },
  hint: {
    width: "100%",
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    marginTop: 4,
  },
  btn: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  btnPrimary: {
    backgroundColor: "#4DBB9A",
    shadowColor: "#4DBB9A",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  // ✅ ส่วนจัดข้อความท้ายหน้า
  centerBlock: {
    alignItems: "center",
    marginTop: 12,
  },
  termsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  normalText: {
    fontSize: 13,
    color: "#0F172A",
  },
  linkGreen: {
    color: "#16A34A",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

export default Signup3Screen;
