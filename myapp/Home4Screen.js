import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Home4Screen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <View style={styles.appBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <Text style={styles.closeText}>ปิด</Text>
              </TouchableOpacity>
              <Text style={styles.appBarTitle}>ช่องทางการติดต่อเรา</Text>
            </View>

      <View style={styles.body}>
        {/* โลโก้ */}
        <View style={styles.logoContainer}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.text}>
          ติดต่อเรา{'\n'}
          หากคุณมีคำถาม ข้อเสนอแนะ หรือพบปัญหาในการใช้งาน กรุณาติดต่อทีมงานผ่านช่องทางด้านล่างนี้
        </Text>

        {/* ข้อมูลติดต่อ */}
        <Text style={styles.title}>ข้อมูลติดต่อ</Text>
        <Text style={styles.bodyText}>
          HarnKeng (หารเก่ง){'\n'}
          อาคารนวัตกรรม มหาวิทยาลัยเทคโนโลยีสุรนารี อ.เมือง จ.นครราชสีมา 30000{'\n'}
          098-xxx-xxxx{'\n'}
          support@harnkeng.app{'\n'}
          จันทร์ - ศุกร์ เวลา 09:00 - 17:00 น.
        </Text>

        {/* ช่องทางอื่นๆ */}
        <Text style={styles.title}>ช่องทางอื่นๆ</Text>
        <Text style={styles.bodyText}>
          Ig: @harnkeng_official{'\n'}
          Line: @harnkeng{'\n'}
          Facebook: @harnkeng.official
        </Text>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  appBar: {
    backgroundColor: '#7AD5CC',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    flex: 1,
  },
  body: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
});

export default Home4Screen;
