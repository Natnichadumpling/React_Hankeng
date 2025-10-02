import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { supabase } from "./supabaseClient";
import { useNavigation } from "@react-navigation/native";
import TabBar from "./components/TabBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Page2Screen = ({ route }) => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupImage, setNewGroupImage] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [email, setEmail] = useState("");

  // ดึง email จาก AsyncStorage ทุกครั้งที่ focus
  useFocusEffect(
    React.useCallback(() => {
      const getEmail = async () => {
        let storedEmail = route?.params?.email;
        let storedUserName = route?.params?.userName;

        if (!storedEmail) {
          storedEmail = await AsyncStorage.getItem("userEmail");
          console.log(
            "Retrieved email from AsyncStorage in Page2Screen:",
            storedEmail
          );
        } else {
          await AsyncStorage.setItem("userEmail", storedEmail);
          console.log(
            "Saved email to AsyncStorage in Page2Screen:",
            storedEmail
          );
        }

        if (!storedUserName && storedEmail) {
          const { data, error } = await supabase
            .from("users")
            .select("name")
            .eq("email", storedEmail)
            .single();

          if (data && data.name) {
            storedUserName = data.name;
            console.log("Retrieved username from database:", storedUserName);
          }
        }

        if (storedEmail) setEmail(storedEmail);
        if (storedUserName) setUserName(storedUserName);
      };

      getEmail();
    }, [route?.params?.email, route?.params?.userName])
  );

  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) return;
      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("email", email)
        .single();
      if (data && data.name) setUserName(data.name);
    };
    fetchUserName();
  }, [email]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from("groups").select("*");
      if (data) setGroups(data);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setActivities(data);
      setIsLoadingActivities(false);
    };
    fetchActivities();
  }, []);

  const latestGroups = [...groups]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2);

  const handleGroupPress = (group) => {
    navigation.navigate("Group5Screen", {
      groupName: group.name,
    });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !email) return;
    let imageUrl = null;
    if (newGroupImage) {
    }
    const category = "ทั่วไป";
    const image = "";
    const { data, error } = await supabase
      .from("groups")
      .insert([
        {
          name: newGroupName,
          created_by: email,
          category,
          image,
          image_url: imageUrl,
        },
      ])
      .select();
    if (!error && data && data[0]) {
      setNewGroupName("");
      setNewGroupImage(null);
      let userId = null;
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (userData && userData.id) userId = userData.id;
      await supabase.from("activities").insert({
        user_id: userId,
        type: "create_group",
        description: `สร้างกลุ่ม ${newGroupName}`,
        group_id: data[0].id,
        created_at: new Date().toISOString(),
      });
      const { data: groupData } = await supabase.from("groups").select("*");
      if (groupData) setGroups(groupData);
      const { data: activityData } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (activityData) setActivities(activityData);
    }
  };

  const bottomTabs = [
    {
      name: "หน้าหลัก",
      icon: require("./assets/images/logo1.png"),
      active: true,
      navigateTo: "Page2Screen",
    },
    {
      name: "กลุ่ม",
      icon: require("./assets/images/logo2.png"),
      active: false,
      navigateTo: "Group3Screen",
    },
    {
      name: "กิจกรรม",
      icon: require("./assets/images/logo3.png"),
      active: false,
      navigateTo: "ActivityScreen",
    },
    {
      name: "บัญชี",
      icon: require("./assets/images/logo4.png"),
      active: false,
      navigateTo: "AccountScreen",
      params: { email, userName },
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require("./assets/images/p1.png")}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContent}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>สวัสดี !</Text>
              <Text style={styles.nameText}>{userName || "..."}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate("Setting2Screen")}
              activeOpacity={0.7}
            >
              <View style={styles.settingsIconContainer}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.createGroupCard}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate("GroupScreen", { email })}
            >
              <Text style={styles.createBtnText}>สร้างกลุ่ม</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainCard}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 8,
              }}
            >
              กลุ่มล่าสุดที่สร้าง
            </Text>
            {latestGroups.length === 0 ? (
              <Text style={{ color: "#999", fontSize: 14 }}>ไม่พบกลุ่ม</Text>
            ) : (
              latestGroups.map((group, idx) => (
                <TouchableOpacity
                  key={group.id || idx}
                  style={styles.groupCard}
                  onPress={() => handleGroupPress(group)}
                >
                  {group.image_url ? (
                    <Image
                      source={{ uri: group.image_url }}
                      style={styles.groupImage}
                    />
                  ) : (
                    <View style={styles.groupImagePlaceholder}>
                      <Text style={styles.placeholderText}>🖼️</Text>
                    </View>
                  )}
                  <Text style={styles.groupName}>{group.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.activitySection}>
            <Text style={styles.activityTitle}>กิจกรรมล่าสุด</Text>
            {isLoadingActivities ? (
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>กำลังโหลด...</Text>
              </View>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityAvatar}>
                    <Image
                      source={require("./assets/images/logo2.png")}
                      style={styles.activityAvatarImage}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTime}>
                      {activity.created_at
                        ? new Date(activity.created_at).toLocaleString("th-TH")
                        : ""}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>
                  ไม่พบกิจกรรมการสร้างกลุ่ม
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginBottom: 80 }} />
        </ScrollView>
      </ImageBackground>
      <TabBar bottomTabs={bottomTabs} navigation={navigation} email={email} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollContent: {
    flex: 1,
  },
  createGroupCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createGroupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c5aa0",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  uploadBtn: {
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  uploadBtnText: {
    color: "#2c5aa0",
    fontWeight: "bold",
  },
  createBtn: {
    backgroundColor: "#2c5aa0",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 18,
    color: "#666",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c5aa0",
  },
  settingsBtn: {
    padding: 8,
  },
  settingsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIcon: {
    fontSize: 24,
  },
  mainCard: {
    backgroundColor: "#e8f4f8",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  groupCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#eee",
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#aaa",
    fontSize: 24,
  },
  groupName: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
  },
  activitySection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c5aa0",
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f4f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
  },
});

export default Page2Screen;
