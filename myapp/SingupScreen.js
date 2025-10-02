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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { hashPassword } from "./utils/hashPassword";

const SingupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          />
          <TextInput
            style={styles.input}
            placeholder="รหัสผ่าน"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.validationText}>
            *ต้องมีตัวอักขระอย่างน้อย 8 ตัว
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "rgb(67, 154, 67)" }]}
            onPress={async () => {
              const hashed = await hashPassword(password);
              navigation.navigate("Singup2Screen", {
                email,
                hashedPassword: hashed,
              });
            }}
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
  appBar: {
    backgroundColor: "transparent",
    elevation: 0,
    paddingTop: 20,
    paddingLeft: 10,
  },
  closeButton: {
    position: "absolute",
    left: 0,
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
  },
  validationText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#232323",
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
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});

export default SingupScreen;
