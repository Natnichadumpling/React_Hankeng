import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabaseClient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const PageScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // รับ userData จาก route.params (ถูกส่งมาจาก LoginScreen)
  const userData = route?.params?.userData;
  const emailFromRoute = userData?.email;
  const nameFromRoute = userData?.name;

  console.log("=== PageScreen Received Data ===");
  console.log("Full route.params:", route?.params);
  console.log("userData:", userData);
  console.log("Email from route:", emailFromRoute);
  console.log("Name from route:", nameFromRoute);

  const [email, setEmail] = useState(emailFromRoute || "");
  const [userName, setUserName] = useState(nameFromRoute || "");
  const [loading, setLoading] = useState(true);

  // ถ้าไม่มี email จาก route, ดึงข้อมูลจาก AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!emailFromRoute || !nameFromRoute) {
          console.log("Loading data from AsyncStorage...");
          const savedEmail = await AsyncStorage.getItem("userEmail");
          const savedName = await AsyncStorage.getItem("userName");
          console.log("Saved email from AsyncStorage:", savedEmail);
          console.log("Saved name from AsyncStorage:", savedName);
          
          if (savedEmail) setEmail(savedEmail);
          if (savedName) setUserName(savedName);
        } else {
          console.log("Using data from route params");
        }
      } catch (error) {
        console.error("Error loading user data from storage:", error);
      }
    };
    loadUserData();
  }, [emailFromRoute, nameFromRoute]);

  // ดึงชื่อจาก Supabase ถ้ามี email แต่ไม่มี name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) {
        console.error("Email is undefined, returning to login...");
        navigation.navigate("HomeScreen");
        return;
      }

      // ถ้ามี userName อยู่แล้ว ไม่ต้องดึงจากฐานข้อมูลอีก
      if (userName && userName !== "") {
        console.log("Username already exists:", userName);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching username from Supabase for email:", email);
        const { data, error } = await supabase
          .from("users")
          .select("name")
          .eq("email", email)
          .single();

        if (error) {
          console.error("Error fetching user name:", error);
          setUserName("Guest");
        } else if (data?.name) {
          console.log("Username fetched from Supabase:", data.name);
          setUserName(data.name);
        }
      } catch (fetchError) {
        console.error("Unexpected error fetching user name:", fetchError);
        setUserName("Guest");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [email, userName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: 10, color: "#333" }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("./assets/images/p2.png")}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        {/* โลโก้ */}
        <View style={styles.logoContainer}>
          <Image
            source={require("./assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        {/* ข้อความต้อนรับ */}
        <Text style={styles.welcomeText}>
          ยินดีต้อนรับ{"\n"}สู่ HarnKeng ,{"\n"}
          <Text style={styles.userName}>{userName}</Text>
        </Text>

        {/* การ์ดข้อมูล */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            ค่าใช้จ่ายทั้งหมด <Text style={styles.amount}>25,000 ฿</Text>
          </Text>

          <View style={styles.itemRow}>
            <FontAwesome
              name="ticket"
              size={26}
              color="#1E90FF"
              style={styles.itemIcon}
            />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>ทริปภูเก็ต</Text>
              <Text style={styles.itemSubtitle}>เที่ยวเป็นหมู่คณะ</Text>
            </View>
            <Text style={styles.itemAmount}>10,500 ฿</Text>
          </View>

          <View style={styles.itemRow}>
            <FontAwesome
              name="cutlery"
              size={26}
              color="#FF5722"
              style={styles.itemIcon}
            />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>ร้านอาหาร</Text>
              <Text style={styles.itemSubtitle}>คุณเป็นหมู่คณะ</Text>
            </View>
            <Text style={styles.itemAmount}>500 ฿</Text>
          </View>
        </View>

        {/* ปุ่มไปหน้าถัดไป */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Page1Screen", { email })}
        >
          <Text style={styles.buttonText}>ถัดไป</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

/* ---- Styles ---- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FFF8",
  },
  innerContainer: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 6,
  },
  logo: { width: 110, height: 110, resizeMode: "contain" },
  welcomeText: {
    fontSize: 22,
    textAlign: "center",
    color: "#333",
    marginBottom: 25,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  card: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#444",
  },
  amount: { fontSize: 18, fontWeight: "bold", color: "#16A34A" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemIcon: { marginRight: 12 },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  itemSubtitle: { fontSize: 14, color: "#666" },
  itemAmount: { fontSize: 15, fontWeight: "bold", color: "#16A34A" },
  button: {
    width: 220,
    height: 55,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    elevation: 4,
  },
  buttonText: { fontSize: 20, color: "white", fontWeight: "bold" },
});

export default PageScreen;