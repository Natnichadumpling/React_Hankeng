import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';

const Group5Screen = ({ route, navigation }) => {
  const [people, setPeople] = useState(route?.params?.groupData?.members || []);
  const [items, setItems] = useState(route?.params?.groupData?.items || []);
  
  // ฟังก์ชันเลือกวิธีการชำระเงิน (เงินสดหรือโอน)
  const [paymentMethod, setPaymentMethod] = useState('cash'); // ค่าเริ่มต้นเป็นเงินสด

  // ฟังก์ชันให้เลือกสมาชิกที่ต้องหาร
  const toggleSharedBy = (itemId, person) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newSharedBy = item.sharedBy.includes(person)
            ? item.sharedBy.filter(p => p !== person)
            : [...item.sharedBy, person];
          return { ...item, sharedBy: newSharedBy };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    if (route?.params?.newPerson) {
      setPeople(prev => [...prev, ...route.params.newPerson]);  // อัปเดตคนที่เพิ่มใหม่
    }
    if (route?.params?.newItems) {
      setItems(prev => [...prev, ...route.params.newItems]);  // อัปเดตรายการที่เพิ่มใหม่
    }
  }, [route?.params?.newPerson, route?.params?.newItems]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{route?.params?.groupData?.groupName || 'กลุ่มของเรา'}</Text>

      {/* สมาชิก */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สมาชิก ({people.length} คน)</Text>
        <View style={styles.peopleContainer}>
          {people.map((person, index) => (
            <Text key={index} style={styles.personName}>{person}</Text>
          ))}
        </View>
      </View>

      {/* รายการค่าใช้จ่าย */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>รายการค่าใช้จ่าย ({items.length} รายการ)</Text>
        {items.map((item) => {
          const perHead = item.sharedBy.length > 0 ? (item.price / item.sharedBy.length).toFixed(2) : null;
          return (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>฿{item.price.toFixed(2)}</Text>

              {/* Payment method: Cash / Transfer */}
              <Text style={styles.itemSubtext}>วิธีการชำระเงิน:</Text>
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={[styles.paymentMethodButton, paymentMethod === 'cash' && styles.selectedMethod]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Text style={styles.paymentMethodText}>เงินสด</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentMethodButton, paymentMethod === 'transfer' && styles.selectedMethod]}
                  onPress={() => setPaymentMethod('transfer')}
                >
                  <Text style={styles.paymentMethodText}>โอน</Text>
                </TouchableOpacity>
              </View>

              {/* Shared By */}
              <Text style={styles.itemSubtext}>คนที่ต้องหาร:</Text>
              <View style={styles.checkboxContainer}>
                {people.map((person) => (
                  <TouchableOpacity
                    key={`${item.id}-share-${person}`}
                    style={[styles.checkbox, item.sharedBy.includes(person) && styles.checkboxChecked]}
                    onPress={() => toggleSharedBy(item.id, person)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.checkboxText, item.sharedBy.includes(person) && styles.checkboxTextChecked]}>
                      {person}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* คำนวณเงินที่ต้องจ่ายต่อหัว */}
              {perHead && <Text style={styles.itemSubtext}>จำนวนที่ต้องจ่ายต่อหัว: ฿{perHead}</Text>}
            </View>
          );
        })}
      </View>

      {/* ไปยังสรุปการชำระเงิน */}
      <TouchableOpacity style={styles.summaryButton} onPress={() => navigation.navigate('SummaryPayment')}>
        <Text style={styles.summaryButtonText}>ไปยังสรุปการชำระเงิน</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 24, backgroundColor: 'white', padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  addButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 8 },
  addButtonText: { color: 'white' },
  peopleContainer: { marginTop: 10 },
  personName: { fontSize: 16 },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c', marginTop: 4 },
  itemSubtext: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  paymentMethodContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  paymentMethodButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedMethod: {
    backgroundColor: '#3498db',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#34495e',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  checkbox: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxChecked: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  checkboxText: { fontSize: 12, color: '#34495e' },
  checkboxTextChecked: { color: 'white', fontWeight: '600' },
  summaryButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  summaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Group5Screen;
