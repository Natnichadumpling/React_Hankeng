import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Group6Screen = ({ route }) => {
  // รับข้อมูลจาก Group5Screen
  const { people, items, summary } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>สรุปรายจ่าย/โอน</Text>

      {/* สรุปยอดแต่ละคน */}
      {people.map((person) => {
        const paidItems = summary.paidDetail[person] || [];
        const owedItems = summary.shouldPayDetail[person] || [];
        const totalPaid = paidItems.reduce((s, it) => s + it.amount, 0);
        const totalOwed = owedItems.reduce((s, it) => s + it.share, 0);
        const balance = summary.balances[person] || 0;

        return (
          <View key={`sum-${person}`} style={styles.balanceCard}>
            <Text style={styles.personNameLarge}>{person}</Text>

            <Text style={[styles.balanceItem, { fontWeight: '600', marginTop: 6 }]}>รายการที่จ่ายให้กลุ่ม:</Text>
            {paidItems.length ? (
              <View style={{ paddingLeft: 8, marginTop: 4 }}>
                {paidItems.map((it, idx) => (
                  <Text key={`paid-${person}-${idx}`} style={styles.balanceItem}>
                    • {it.itemName}: ฿{it.amount.toFixed(2)}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.balanceItem, { paddingLeft: 8 }]}>• ไม่มีรายการที่จ่ายให้กลุ่ม</Text>
            )}

            <Text style={[styles.balanceItem, { fontWeight: '600', marginTop: 10 }]}>รายละเอียดที่ควรจ่าย:</Text>
            {owedItems.length ? (
              <View style={{ paddingLeft: 8, marginTop: 4 }}>
                {owedItems.map((it, idx) => (
                  <Text key={`owed-${person}-${idx}`} style={styles.balanceItem}>
                    • {it.itemName}: ฿{it.share.toFixed(2)}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.balanceItem, { paddingLeft: 8 }]}>• ไม่มีรายการที่ต้องจ่าย</Text>
            )}

            <View style={styles.separator} />
            <View style={styles.balanceDetails}>
              <Text style={styles.balanceItem}>
                จ่ายไปแล้วรวม: <Text style={styles.paidAmount}>฿{totalPaid.toFixed(2)}</Text>
              </Text>
              <Text style={styles.balanceItem}>
                ควรจ่ายรวม: <Text style={styles.owedAmount}>฿{totalOwed.toFixed(2)}</Text>
              </Text>
              <View style={styles.separator} />
              {balance > 0.01 ? (
                <Text style={styles.balanceItem}>
                  ยอดคงเหลือ (จะได้รับคืน): <Text style={styles.positiveBalance}>฿{balance.toFixed(2)}</Text>
                </Text>
              ) : balance < -0.01 ? (
                <Text style={styles.balanceItem}>
                  ยอดคงเหลือ (ต้องจ่ายเพิ่ม): <Text style={styles.negativeBalance}>฿{Math.abs(balance).toFixed(2)}</Text>
                </Text>
              ) : (
                <Text style={styles.balanceItem}>
                  ยอดคงเหลือ: <Text style={styles.evenBalance}>เท่ากันพอดี</Text>
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  balanceCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  personNameLarge: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  balanceItem: { fontSize: 14, color: '#34495e', marginBottom: 4 },
  separator: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 8 },
  balanceDetails: { paddingLeft: 12 },
  paidAmount: { fontWeight: 'bold', color: '#3498db' },
  owedAmount: { fontWeight: 'bold', color: '#e67e22' },
  positiveBalance: { fontWeight: 'bold', color: '#27ae60' },
  negativeBalance: { fontWeight: 'bold', color: '#e74c3c' },
  evenBalance: { fontWeight: 'bold', color: '#7f8c8d' },
});

export default Group6Screen;
