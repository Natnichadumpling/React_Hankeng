import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';

// ส่วนอื่น ๆ ของ Group5Screen

const Group5Screen = ({ route, navigation }) => {
  // 2.1 Props & State
  const groupData = route?.params?.groupData || DEFAULT_GROUP;
  const [people, setPeople] = useState(groupData.members);
  const [items, setItems] = useState([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const summary = useMemo(() => {
    const balances = {};
    const shouldPayDetail = {};
    const paidDetail = {};

    people.forEach((p) => {
      balances[p] = 0;
      shouldPayDetail[p] = [];
      paidDetail[p] = [];
    });

    items.forEach((item) => {
      const { paidBy, sharedBy, price, name } = item;
      const n = sharedBy.length;
      if (n === 0) return;

      const share = price / n;

      balances[paidBy] += price;
      paidDetail[paidBy].push({ itemName: name, amount: price });

      sharedBy.forEach((p) => {
        balances[p] -= share;
        shouldPayDetail[p].push({ itemName: name, share });
      });
    });

    return { balances, shouldPayDetail, paidDetail };
  }, [items, people]);

  const onViewSummary = () => {
    // ส่งข้อมูลสรุปรายจ่ายไปยัง Group6Screen
    navigation.navigate('Group6Screen', { people, items, summary });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* ส่วนอื่น ๆ ของ Group5Screen */}
      <TouchableOpacity onPress={onViewSummary}>
        <Text>ดูสรุปรายจ่าย/โอน</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  // Styles ที่จำเป็นอื่น ๆ
});

export default Group5Screen;
