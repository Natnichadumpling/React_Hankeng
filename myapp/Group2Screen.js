import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Clipboard,
  SafeAreaView,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import { supabase } from "./supabaseClient";
const Group2Screen = ({ navigation }) => {
  const route = useRoute();
  const { groupName } = route.params;
  const [groupId, setGroupId] = useState(null);
  const [groupImageUrl, setGroupImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupId = async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, image_url")
        .eq("name", groupName)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setGroupId(data[0].id);
        setGroupImageUrl(data[0].image_url || null);
      }
      setLoading(false);
    };
    fetchGroupId();
  }, [groupName]);

  const groupLink = groupId ? `https://example.com/groups/${groupId}` : "";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my group: ${groupName}\nHere's the link: ${groupLink}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(groupLink);
    Alert.alert("ลิงก์ถูกคัดลอกแล้ว", "คุณสามารถส่งลิงก์นี้ให้เพื่อนได้");
  };

  const handleGoToChat = () => {
    navigation.navigate("Group4Screen", { groupName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("./assets/images/p1.png")}
        style={styles.container}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Page2Screen")}
            >
              <Text style={styles.backArrow}>กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ลิ้งค์กลุ่ม: {groupName}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {groupImageUrl ? (
                <Image source={{ uri: groupImageUrl }} style={styles.logo} />
              ) : (
                <Image
                  source={require("./assets/images/logo.png")}
                  style={styles.logo}
                />
              )}
            </View>
            <Text style={styles.infoText}>
              นี่คือลิงก์เชิญเพื่อนเข้ากลุ่มของคุณ:
            </Text>
            {loading ? (
              <Text style={styles.linkText}>กำลังโหลด...</Text>
            ) : groupId ? (
              <Text style={styles.linkText}>{groupLink}</Text>
            ) : (
              <Text style={styles.linkText}>ไม่พบกลุ่ม</Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.copyButton]}
                onPress={handleCopyLink}
              >
                <Text style={[styles.buttonText, styles.copyButtonText]}>
                  📋 คัดลอกลิงก์
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}
              >
                <Text style={[styles.buttonText, styles.shareButtonText]}>
                  🔗 แชร์ลิงก์
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={handleGoToChat}
            >
              <Text style={styles.chatButtonText}>ไปหน้าช่องแชท</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  backButton: { padding: 10 },
  backArrow: { fontSize: 16, color: "#007BFF" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  content: { marginTop: 40, alignItems: "center" },
  logoContainer: { marginBottom: 20 },
  logo: { width: 100, height: 100, resizeMode: "contain" },
  infoText: { fontSize: 16, marginBottom: 10, color: "#333" },
  linkText: { fontSize: 18, color: "#007BFF", marginBottom: 20 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  copyButton: {
    backgroundColor: "#2196F3",
  },
  copyButtonText: {
    color: "#fff",
  },
  shareButton: {
    backgroundColor: "#4CAF50",
  },
  shareButtonText: {
    color: "#fff",
  },
  chatButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 50,
    alignItems: "center",
    width: "100%",
  },
  chatButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default Group2Screen;
