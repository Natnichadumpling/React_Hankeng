import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';  // Correct import

const ChangeScreen = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('THB'); // Default to Thailand code
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>ปิด</Text>
        </TouchableOpacity>
        <Text style={styles.title}>สกุลเงินเริ่มต้น</Text>
      </View>

      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.sectionTitle}>เลือกสกุลเงิน</Text>

        {/* Currency selection options with Picker */}
        <View style={styles.currencyOptions}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setSelectedCurrency('THB')}
          >
            <View style={styles.optionContent}>
              <Image source={require('./assets/images/thai.png')} style={styles.flag} />
              <Text style={styles.optionText}>Baht (THB)</Text>
            </View>
            <Picker
              selectedValue={selectedCurrency}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
            >
              <Picker.Item label="Baht (THB)" value="THB" />
              <Picker.Item label="United States dollar (USD)" value="USD" />
            </Picker>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setSelectedCurrency('USD')}
          >
            <View style={styles.optionContent}>
              <Image source={require('./assets/images/usa.png')} style={styles.flag} />
              <Text style={styles.optionText}>United States dollar (USD)</Text>
            </View>
            <Picker
              selectedValue={selectedCurrency}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
            >
              <Picker.Item label="USD" value="USD" />
            </Picker>
          </TouchableOpacity>
        </View>

        <Text style={styles.selectedCurrency}>
          {selectedCurrency === 'THB'
            ? 'ฉันใช้ THB (฿) เป็นสกุลเงินของฉัน'
            : 'ฉันใช้ USD (\$) เป็นสกุลเงินของฉัน'}
        </Text>

        {/* Button Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Singup3Screen')}
          >
            <Text style={styles.buttonText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('Singup3Screen')}
          >
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 20,
    paddingLeft: 10,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
  },
  closeText: {
    color: 'black',
    fontSize: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  currencyOptions: {
    width: '100%',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
  selectedCurrency: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'grey',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: '#43B020',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ChangeScreen;
