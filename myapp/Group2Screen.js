import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Clipboard, SafeAreaView, Image, ImageBackground, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const Group2Screen = ({ navigation }) => {
  const route = useRoute();
  const { groupName } = route.params;  // Get the group name passed from GroupScreen
  
  // Generate a group link (example link, you can change this to dynamic URL generation)
  const groupLink = `https://example.com/groups/${groupName.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Function to share the group link
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my group: ${groupName}\nHere's the link: ${groupLink}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Function to copy the group link to clipboard
  const handleCopyLink = () => {
    Clipboard.setString(groupLink);
    Alert.alert('ลิงก์ถูกคัดลอกแล้ว', 'คุณสามารถส่งลิงก์นี้ให้เพื่อนได้');
  };

  // Function to go to chat screen (Group4Screen)
  const handleGoToChat = () => {
    navigation.navigate('Group4Screen', { groupName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Page2Screen')}>
              <Text style={styles.backArrow}>กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ลิ้งค์กลุ่ม: {groupName}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={require('./assets/images/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.infoText}>นี่คือลิงก์กลุ่มของคุณ:</Text>
            <Text style={styles.linkText}>{groupLink}</Text>

            {/* Button Section */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleCopyLink}>
                <Text style={styles.buttonText}>คัดลอกลิงก์</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Text style={styles.buttonText}>แชร์ลิงก์</Text>
              </TouchableOpacity>
            </View>

            {/* New Button: Go to Chat */}
            <TouchableOpacity style={styles.chatButton} onPress={handleGoToChat}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  backButton: { padding: 10 },
  backArrow: { fontSize: 16, color: '#007BFF' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { marginTop: 40, alignItems: 'center' },
  logoContainer: { marginBottom: 20 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  infoText: { fontSize: 16, marginBottom: 10, color: '#333' },
  linkText: { fontSize: 18, color: '#007BFF', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // New Chat Button
  chatButton: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 270,
    alignItems: 'center',
    width: '100%',
  },
  chatButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Group2Screen;
