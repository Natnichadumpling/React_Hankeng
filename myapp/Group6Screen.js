import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

/* เช็กบ็อกซ์ */
const CheckBox = ({ checked, onToggle, label }) => (
  <TouchableOpacity onPress={onToggle} style={styles.checkboxRow} activeOpacity={0.7}>
    <View style={[styles.checkboxSquare, checked && styles.checkboxSquareOn]}>
      {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
    </View>
    {label ? <Text style={styles.checkboxRowLabel}>{label}</Text> : null}
  </TouchableOpacity>
);

const Group6Screen = ({ route, navigation }) => {
  const { people, items, groupName = 'กลุ่มของเรา' } = route.params || {};
  
  // สถานะการชำระ
  const [settledMap, setSettledMap] = useState({});
  const [showSettled, setShowSettled] = useState(false);

  // คำนวณยอดสรุปแต่ละคน
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

      // คนที่จ่าย
      balances[paidBy] += price;
      paidDetail[paidBy].push({ itemName: name, amount: price });

      // คนที่ต้องแบ่งจ่าย
      sharedBy.forEach((p) => {
        balances[p] -= share;
        shouldPayDetail[p].push({ itemName: name, share });
      });
    });

    return { balances, shouldPayDetail, paidDetail };
  }, [items, people]);

  // คำนวณรายการโอน
  const allTransfers = useMemo(() => {
    const debtors = [];
    const creditors = [];

    Object.entries(summary.balances).forEach(([person, amt]) => {
      if (amt < -0.01) debtors.push({ person, amount: Math.abs(amt) });
      else if (amt > 0.01) creditors.push({ person, amount: amt });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const list = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      const amount = Math.min(d.amount, c.amount);

      if (amount > 0.01) {
        const key = `${d.person}|${c.person}`;
        const settled = !!settledMap[key];
        list.push({ 
          from: d.person, 
          to: c.person, 
          amount, 
          key, 
          settled 
        });
      }

      d.amount -= amount;
      c.amount -= amount;
      if (d.amount < 0.01) i++;
      if (c.amount < 0.01) j++;
    }

    return list;
  }, [summary.balances, settledMap]);

  const transfers = useMemo(
    () => allTransfers.filter((t) => (showSettled ? true : !t.settled)),
    [allTransfers, showSettled]
  );

  // ฟังก์ชันช่วย
  const makeTransferKey = (from, to) => `${from}|${to}`;

  const toggleSettle = (transferKey) => {
    setSettledMap((prev) => {
      const next = { ...prev };
      if (next[transferKey]) {
        delete next[transferKey];
      } else {
        next[transferKey] = { settled: true };
      }
      return next;
    });
  };

  const onClearAllSettled = () => {
    Alert.alert(
      'ยืนยัน',
      'ต้องการล้างสถานะชำระแล้วทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: () => setSettledMap({}) }
      ]
    );
  };

  const goAttachProof = (transfer) => {
    navigation.navigate('Group4Screen', {
      groupName,
      transferKey: transfer.key,
      from: transfer.from,
      to: transfer.to,
      amount: transfer.amount,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>สรุปการชำระเงิน</Text>
        <Text style={styles.subtitle}>{groupName}</Text>
      </View>

      {/* สรุปยอดรวมทั้งหมด */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สรุปยอดรวม</Text>
        
        {items.length > 0 ? (
          <View style={styles.totalSummary}>
            <Text style={styles.totalAmount}>
              ค่าใช้จ่ายทั้งหมด: ฿{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>
            <Text style={styles.totalItems}>
              รายการทั้งหมด: {items.length} รายการ
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>ไม่มีรายการค่าใช้จ่าย</Text>
        )}
      </View>

      {/* สรุปยอดแต่ละคน */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สรุปยอดแต่ละคน</Text>
        
        {people.map((person) => {
          const paidItems = summary.paidDetail[person] || [];
          const owedItems = summary.shouldPayDetail[person] || [];

          const totalPaid = paidItems.reduce((s, it) => s + it.amount, 0);
          const totalOwed = owedItems.reduce((s, it) => s + it.share, 0);
          const balance = summary.balances[person] || 0;

          return (
            <View key={`balance-${person}`} style={styles.personCard}>
              <Text style={styles.personName}>{person}</Text>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>จ่ายไปแล้ว:</Text>
                <Text style={styles.paidAmount}>฿{totalPaid.toFixed(2)}</Text>
              </View>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>ควรจ่าย:</Text>
                <Text style={styles.owedAmount}>฿{totalOwed.toFixed(2)}</Text>
              </View>

              <View style={styles.separator} />
              
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>ยอดสุทธิ:</Text>
                {balance > 0.01 ? (
                  <Text style={styles.positiveBalance}>
                    +฿{balance.toFixed(2)} (จะได้รับคืน)
                  </Text>
                ) : balance < -0.01 ? (
                  <Text style={styles.negativeBalance}>
                    -฿{Math.abs(balance).toFixed(2)} (ต้องจ่ายเพิ่ม)
                  </Text>
                ) : (
                  <Text style={styles.evenBalance}>
                    ฿0.00 (เท่ากัน)
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* รายการโอน/ชำระ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการโอน/ชำระ</Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: showSettled ? '#95a5a6' : '#3498db' }
              ]}
              onPress={() => setShowSettled(!showSettled)}
            >
              <Text style={styles.actionButtonText}>
                {showSettled ? 'ซ่อนที่ชำระแล้ว' : 'แสดงที่ชำระแล้ว'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={onClearAllSettled}
            >
              <Text style={styles.actionButtonText}>ล้างสถานะทั้งหมด</Text>
            </TouchableOpacity>
          </View>
        </View>

        {transfers.length > 0 ? (
          transfers.map((transfer, index) => {
            const isSettled = !!settledMap[transfer.key];

            return (
              <View 
                key={`transfer-${index}`} 
                style={[
                  styles.transferCard,
                  isSettled && styles.settledTransferCard
                ]}
              >
                <View style={styles.transferHeader}>
                  <Text style={styles.transferNumber}>#{index + 1}</Text>
                  {isSettled && (
                    <View style={styles.settledBadge}>
                      <Text style={styles.settledBadgeText}>ชำระแล้ว</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.transferText}>
                  <Text style={styles.fromPerson}>{transfer.from}</Text>
                  {' ต้องโอนให้ '}
                  <Text style={styles.toPerson}>{transfer.to}</Text>
                </Text>

                <Text style={styles.transferAmount}>
                  จำนวน ฿{transfer.amount.toFixed(2)}
                </Text>

                <View style={styles.transferActions}>
                  <CheckBox
                    checked={isSettled}
                    onToggle={() => toggleSettle(transfer.key)}
                    label="ทำเครื่องหมายว่าชำระแล้ว"
                  />

                  <TouchableOpacity
                    style={styles.attachButton}
                    onPress={() => goAttachProof(transfer)}
                  >
                    <Text style={styles.attachButtonText}>แนบหลักฐาน</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : allTransfers.length === 0 ? (
          <View style={styles.noTransferCard}>
            <Text style={styles.noTransferText}>
              🎉 ไม่มีรายการที่ต้องโอน ทุกคนจ่ายครบแล้ว!
            </Text>
          </View>
        ) : (
          <View style={styles.noTransferCard}>
            <Text style={styles.noTransferText}>
              ✅ ชำระครบทุกรายการแล้ว
            </Text>
          </View>
        )}
      </View>

      {/* สถิติ */}
      {allTransfers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สถิติการชำระ</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{allTransfers.length}</Text>
              <Text style={styles.statLabel}>รายการทั้งหมด</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#27ae60' }]}>
                {allTransfers.filter(t => t.settled).length}
              </Text>
              <Text style={styles.statLabel}>ชำระแล้ว</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {allTransfers.filter(t => !t.settled).length}
              </Text>
              <Text style={styles.statLabel}>ยังไม่ชำระ</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(allTransfers.filter(t => t.settled).length / allTransfers.length) * 100}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((allTransfers.filter(t => t.settled).length / allTransfers.length) * 100)}% เสร็จสิ้น
            </Text>
          </View>
        </View>
      )}

      {/* ปุ่มกลับ */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>กลับไปแก้ไข</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  totalSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  totalItems: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: 20,
  },
  personCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#34495e',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  owedAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e67e22',
  },
  positiveBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  negativeBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  evenBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  transferCard: {
    backgroundColor: '#f8fffe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  settledTransferCard: {
    backgroundColor: '#f0f0f0',
    borderLeftColor: '#95a5a6',
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  settledBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  settledBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  transferText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  fromPerson: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  toPerson: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  transferAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 12,
  },
  transferActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  checkboxSquareOn: {
    borderColor: '#27ae60',
    backgroundColor: '#e8f5e8',
  },
  checkboxTick: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  checkboxRowLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  attachButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  attachButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noTransferCard: {
    backgroundColor: '#d5f4e6',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noTransferText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#3498db',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Group6Screen;