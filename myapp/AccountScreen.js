import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Image, ScrollView, Modal,
  Animated, Dimensions, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import TabBar from './components/TabBar'; // Import TabBar

const { width } = Dimensions.get('window');

const AccountScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // Fetch user data from supabase
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const fetchUserName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      const nameFromMetadata = session?.user?.user_metadata?.name;

      if (!email) return;

      const { data } = await supabase
        .from('users')
        .select('name, email')
        .eq('email', email)
        .single();

      if (data?.name) {
        setUserName(data.name);
        setUserEmail(data.email || email);
      } else if (nameFromMetadata) {
        setUserName(nameFromMetadata);
        setUserEmail(email);
      } else {
        setUserName('ผู้ใช้งาน');
        setUserEmail(email);
      }
    };
    fetchUserName();
  }, []);

  const bottomTabs = [
    { 
      name: 'หน้าหลัก', 
      icon: require('./assets/images/logo1.png'), 
      active: false, 
      navigateTo: 'Page2Screen',
      gradient: ['#667eea', '#764ba2']
    },
    { 
      name: 'กลุ่ม', 
      icon: require('./assets/images/logo2.png'), 
      active: false, 
      navigateTo: 'Group3Screen',
      gradient: ['#f093fb', '#f5576c']
    },
    { 
      name: 'กิจกรรม', 
      icon: require('./assets/images/logo3.png'), 
      active: false, 
      navigateTo: 'ActivityScreen',
      gradient: ['#4facfe', '#00f2fe']
    },
    { 
      name: 'บัญชี', 
      icon: require('./assets/images/logo4.png'), 
      active: true,
      gradient: ['#43e97b', '#38f9d7']
    }
  ];

  const menuItems = [
    { 
      title: 'การตั้งค่า', 
      icon: '⚙️', 
      navigateTo: 'SettingScreen',
      color: '#667eea',
      description: 'จัดการข้อมูลส่วนตัว'
    },
    { 
      title: 'HarnKeng Pro', 
      icon: '💎', 
      navigateTo: 'ProScreen',
      color: '#ffd700',
      description: 'อัพเกรดเป็นสมาชิกพรีเมียม',
      isPro: true
    },
    { 
      title: 'ให้คะแนน HarnKeng', 
      icon: '⭐', 
      navigateTo: 'RateAppScreen',
      color: '#ff6b6b',
      description: 'แบ่งปันประสบการณ์ของคุณ'
    },
    { 
      title: 'ติดต่อเรา', 
      icon: '📞', 
      navigateTo: 'Home4Screen',
      color: '#4ecdc4',
      description: 'ช่วยเหลือและสนับสนุน'
    }
  ];

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const handleMenuPress = (item) => {
    const scaleValue = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    if (item.navigateTo) {
      setTimeout(() => navigation.navigate(item.navigateTo), 150);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.backgroundImage}
        blurRadius={1}
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Profile Section */}
            <Animated.View 
              style={[
                styles.profileSection,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageBorder}>
                  <Image
                    source={require('./assets/images/logo.png')}
                    style={styles.profileImage}
                  />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>128</Text>
                  <Text style={styles.statLabel}>กิจกรรม</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>45</Text>
                  <Text style={styles.statLabel}>เพื่อน</Text>
                </View>
              </View>
            </Animated.View>

            {/* Enhanced Menu List */}
            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>เมนูหลัก</Text>
              {menuItems.map((item, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.menuItemContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 + (index * 10)]
                        })
                      }]
                    }
                  ]}
                >
                  <AnimatedTouchable
                    style={[
                      styles.menuItem,
                      item.isPro && styles.proMenuItem
                    ]}
                    onPress={() => handleMenuPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={[
                          styles.menuTitle,
                          item.isPro && styles.proMenuTitle
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                    </View>
                    {item.isPro && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                    <Text style={styles.menuArrow}>›</Text>
                  </AnimatedTouchable>
                </Animated.View>
              ))}
            </View>

            {/* Enhanced Logout Button */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setShowLogoutModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutIcon}>👋</Text>
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </Animated.View>

        {/* Enhanced Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <View style={styles.navIndicator} />
          {bottomTabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.bottomTab, tab.active && styles.bottomTabActive]}
              onPress={() => {
                if (tab.navigateTo) {
                  navigation.navigate(tab.navigateTo);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabIconContainer,
                tab.active && styles.activeTabIconContainer
              ]}>
                <Image source={tab.icon} style={styles.bottomTabIcon} />
              </View>
              <Text style={[
                styles.bottomTabText, 
                tab.active && styles.bottomTabTextActive
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Enhanced Logout Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
        >
<<<<<<< HEAD
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <TabBar bottomTabs={bottomTabs} />
      
      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.modalLogo}
            />
            <Text style={styles.modalTitle}>ลาก่อน {userName} 👋</Text>
            <Text style={styles.modalText}>ขอบคุณที่ใช้ HarnKeng</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowLogoutModal(false);
                navigation.navigate('LoginScreen');
              }}
            >
              <Text style={styles.modalButtonText}>ตกลง</Text>
            </TouchableOpacity>
=======
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalBox,
              {
                transform: [{
                  scale: showLogoutModal ? 1 : 0.8
                }]
              }
            ]}>
              <View style={styles.modalHeader}>
                <Image
                  source={require('./assets/images/logo.png')}
                  style={styles.modalLogo}
                />
                <View style={styles.modalCloseContainer}>
                  <TouchableOpacity
                    onPress={() => setShowLogoutModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.modalTitle}>ลาก่อน {userName} 👋</Text>
              <Text style={styles.modalText}>
                ขอบคุณที่ใช้ HarnKeng{'\n'}
                หวังว่าจะได้พบกันใหม่เร็วๆ นี้!
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>ยกเลิก</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    setShowLogoutModal(false);
                    navigation.navigate('LoginScreen');
                  }}
                >
                  <Text style={styles.modalConfirmText}>ออกจากระบบ</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
>>>>>>> 52031acffc5bada89cd795c48ae368ced25c07cf
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 }, // Make sure there's enough space at the bottom
=======
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 90, 160, 0.1)',
  },
  content: {
    flex: 1,
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 120,
    paddingTop: 60,
  },
  
  // Enhanced Profile Section
>>>>>>> 52031acffc5bada89cd795c48ae368ced25c07cf
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImageBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 5,
    backgroundColor: 'linear-gradient(45deg, #667eea, #764ba2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },

  // Enhanced Menu
  menuContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 15,
    paddingLeft: 5,
  },
  menuItemContainer: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  proMenuItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  proMenuTitle: {
    color: '#b8860b',
  },
  menuDescription: {
    fontSize: 14,
    color: '#888',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 10,
  },
  proBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b8860b',
  },

  // Enhanced Logout Button
  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: { 
    fontSize: 18, 
    color: '#fff', 
    fontWeight: 'bold'
  },

  // Enhanced Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
<<<<<<< HEAD
    bottom: 0, left: 0, right: 0,
    height: 70,  // ทำให้แถบ TabBar สูงเท่ากัน
=======
    bottom: 0, 
    left: 0, 
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  navIndicator: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  bottomTab: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 8,
  },
  bottomTabActive: { 
    transform: [{ scale: 1.05 }],
  },
  tabIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  activeTabIconContainer: {
    backgroundColor: 'rgba(44, 90, 160, 0.1)',
  },
  bottomTabIcon: { 
    width: 28, 
    height: 28, 
    resizeMode: 'contain' 
  },
  bottomTabText: { 
    fontSize: 12, 
    color: '#666',
    textAlign: 'center',
  },
  bottomTabTextActive: { 
    color: '#2c5aa0', 
    fontWeight: '700' 
>>>>>>> 52031acffc5bada89cd795c48ae368ced25c07cf
  },

  // Enhanced Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    width: width * 0.85,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalLogo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  modalCloseContainer: {
    marginTop: -5,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold', 
  },
});

export default AccountScreen;
