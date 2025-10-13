import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Image,
  ImageBackground,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

const Group2Screen = ({ navigation }) => {
  const route = useRoute();
  const { groupId, groupName, imageUrl } = route.params || {};

  const groupLink = groupId
    ? `https://example.com/groups/${groupId}`
    : "https://example.com/groups";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `เข้าร่วมกลุ่ม "${groupName}" ได้ที่: ${groupLink}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(groupLink);
    Alert.alert("คัดลอกลิงก์สำเร็จ", "คุณสามารถส่งลิงก์นี้ให้เพื่อนได้เลย!");
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("GroupScreen")}
            >
              <Text style={styles.backArrow}>← กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ลิงก์กลุ่ม: {groupName}</Text>
          </View>

          <View style={styles.content}>
            {/* ✅ แสดงภาพกลุ่ม */}
            <View style={styles.logoContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.logo} />
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
            <Text style={styles.linkText}>{groupLink}</Text>

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
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: { padding: 10 },
  backArrow: { fontSize: 16, color: "#007BFF" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  content: { alignItems: "center" },
  logoContainer: { marginBottom: 20 },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#007BFF",
    resizeMode: "cover",
  },
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
  copyButton: { backgroundColor: "#2196F3" },
  copyButtonText: { color: "#fff" },
  shareButton: { backgroundColor: "#4CAF50" },
  shareButtonText: { color: "#fff" },
  chatButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 40,
    alignItems: "center",
    width: "100%",
  },
  chatButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default Group2Screen;
