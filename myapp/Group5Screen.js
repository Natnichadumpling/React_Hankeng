import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

/* =========================================================================
 * 1) DEFAULTS
 * ========================================================================= */
const DEFAULT_GROUP = {
  groupName: 'กลุ่มของเรา',
  members: ['คุณ', 'เพื่อน A', 'เพื่อน B'],
};

/* เช็กบ็อกซ์แบบกดได้ ใช้ได้ทั้ง Android/iOS */
const CheckBox = ({ checked, onToggle, label }) => (
  <TouchableOpacity onPress={onToggle} style={styles.checkboxRow} activeOpacity={0.7}>
    <View style={[styles.checkboxSquare, checked && styles.checkboxSquareOn]}>
      {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
    </View>
    {label ? <Text style={styles.checkboxRowLabel}>{label}</Text> : null}
  </TouchableOpacity>
);

/* =========================================================================
 * 2) COMPONENT
 * ========================================================================= */
const Group5Screen = ({ route, navigation }) => {
  // -------- 2.1 Props & State
  const groupData = route?.params?.groupData || DEFAULT_GROUP;

  const [people, setPeople] = useState(groupData.members);
  const [items, setItems] = useState([]);

  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // โอนที่ “ทำเครื่องหมายว่าชำระแล้ว” (key = `${from}|${to}`)
  const [settledMap, setSettledMap] = useState({});
  const [showSettled, setShowSettled] = useState(false);

  /* =========================================================================
   * 3) HELPERS
   * ========================================================================= */
  const makeTransferKey = (from, to) => `${from}|${to}`;

  const confirm = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ตกลง', onPress: onConfirm },
    ]);
  };

  /* =========================================================================
   * 4) MEMOIZED SUMMARIES
   * ========================================================================= */
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

      // ผู้จ่ายล่วงหน้า
      balances[paidBy] += price;
      paidDetail[paidBy].push({ itemName: name, amount: price });

      // ผู้ร่วมหาร
      sharedBy.forEach((p) => {
        balances[p] -= share;
        shouldPayDetail[p].push({ itemName: name, share });
      });
    });

    return { balances, shouldPayDetail, paidDetail };
  }, [items, people]);

  // ลูกหนี้->เจ้าหนี้
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
        const key = makeTransferKey(d.person, c.person);
        const settled = !!settledMap[key];
        list.push({ from: d.person, to: c.person, amount, key, settled, note: settledMap[key]?.note });
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

  /* =========================================================================
   * 5) EVENT HANDLERS
   * ========================================================================= */
  // People
  const onAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    setPeople((prev) => [...prev, name]);
    setNewPersonName('');
    setIsAddPersonOpen(false);
  };

  const onRemovePerson = (person) => {
    if (people.length <= 1) {
      Alert.alert('ไม่สามารถลบได้', 'ต้องมีสมาชิกอย่างน้อย 1 คน');
      return;
    }
    confirm(
      'ยืนยันการลบ',
      `ต้องการลบ "${person}" ออกจากกลุ่มใช่หรือไม่?\n\nจะลบออกจากรายการค่าใช้จ่ายทั้งหมดด้วย`,
      () => {
        setPeople((prev) => prev.filter((p) => p !== person));
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            paidBy: item.paidBy === person ? people.find((p) => p !== person) : item.paidBy,
            sharedBy: item.sharedBy.filter((p) => p !== person),
          }))
        );
      }
    );
  };

  // Items
  const onAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);

    if (!name || !newItemPrice.trim() || isNaN(price) || price <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อรายการและราคาที่ถูกต้อง');
      return;
    }

    setItems((prev) => [
      ...prev,
      { id: Date.now(), name, price, paidBy: 'คุณ', sharedBy: [] },
    ]);
    setNewItemName('');
    setNewItemPrice('');
    setIsAddItemOpen(false);
  };

  const onRemoveItem = (itemId) => setItems((prev) => prev.filter((it) => it.id !== itemId));

  const onUpdatePaidBy = (itemId, person) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, paidBy: person } : it)));
  };

  const onToggleSharedBy = (itemId, person) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const included = it.sharedBy.includes(person);
        return {
          ...it,
          sharedBy: included ? it.sharedBy.filter((p) => p !== person) : [...it.sharedBy, person],
        };
      })
    );
  };

  // Settlements
  const onClearAllSettled = () => confirm('ยืนยัน', 'ล้างสถานะชำระแล้วทั้งหมด?', () => setSettledMap({}));

  /* =========================================================================
   * 6) UI
   * ========================================================================= */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <Text style={styles.header}>{groupData.groupName}</Text>
      <Text style={styles.subHeader}>หารค่าใช้จ่าย</Text>

      {/* Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายชื่อสมาชิก ({people.length} คน)</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddPersonOpen(true)} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ เพิ่มคน</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.peopleContainer}>
          {people.map((person) => (
            <View key={person} style={styles.personChip}>
              <Text style={styles.personName}>{person}</Text>
              <TouchableOpacity onPress={() => onRemovePerson(person)} style={styles.removePersonButton} activeOpacity={0.8}>
                <Text style={styles.removePersonButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการค่าใช้จ่าย ({items.length} รายการ)</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddItemOpen(true)} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ เพิ่มรายการ</Text>
          </TouchableOpacity>
        </View>

        {items.map((item) => {
          const perHead = item.sharedBy.length > 0 ? (item.price / item.sharedBy.length).toFixed(2) : null;

          return (
            <View key={item.id} style={styles.itemCard}>
              {/* ชื่อรายการ / ราคา / ลบ */}
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>฿{item.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.deleteButton} activeOpacity={0.8}>
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* ผู้จ่าย */}
              <Text style={styles.itemSubtext}>จ่ายโดย:</Text>
              <View style={styles.checkboxContainer}>
                {people.map((p) => (
                  <TouchableOpacity
                    key={`${item.id}-paid-${p}`}
                    style={[styles.checkbox, item.paidBy === p && styles.paidByChecked]}
                    onPress={() => onUpdatePaidBy(item.id, p)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.checkboxText, item.paidBy === p && styles.paidByTextChecked]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ผู้ร่วมหาร */}
              <Text style={styles.itemSubtext}>คนที่ต้องหาร:</Text>
              <View style={styles.checkboxContainer}>
                {people.map((p) => (
                  <TouchableOpacity
                    key={`${item.id}-share-${p}`}
                    style={[styles.checkbox, item.sharedBy.includes(p) && styles.checkboxChecked]}
                    onPress={() => onToggleSharedBy(item.id, p)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.checkboxText, item.sharedBy.includes(p) && styles.checkboxTextChecked]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Breakdown ต่อหัว */}
              {perHead && (
                <View style={styles.shareDetailContainer}>
                  <Text style={styles.shareInfo}>หารกัน {item.sharedBy.length} คน = ฿{perHead}/คน</Text>
                  <View style={styles.shareBreakdown}>
                    {item.sharedBy.map((p) => (
                      <Text key={`${item.id}-line-${p}`} style={styles.shareBreakdownItem}>• {p}: ฿{perHead}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Summary per person */}
      {items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สรุปยอดแต่ละคน (พร้อมรายละเอียด)</Text>

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
                      <Text key={`paid-${person}-${idx}`} style={styles.balanceItem}>• {it.itemName}: ฿{it.amount.toFixed(2)}</Text>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.balanceItem, { paddingLeft: 8 }]}>• ไม่มีรายการที่จ่ายให้กลุ่ม</Text>
                )}

                <Text style={[styles.balanceItem, { fontWeight: '600', marginTop: 10 }]}>รายละเอียดที่ควรจ่าย:</Text>
                {owedItems.length ? (
                  <View style={{ paddingLeft: 8, marginTop: 4 }}>
                    {owedItems.map((it, idx) => (
                      <Text key={`owed-${person}-${idx}`} style={styles.balanceItem}>• {it.itemName}: ฿{it.share.toFixed(2)}</Text>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.balanceItem, { paddingLeft: 8 }]}>• ไม่มีรายการที่ต้องจ่าย</Text>
                )}

                <View style={styles.separator} />
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceItem}>จ่ายไปแล้วรวม: <Text style={styles.paidAmount}>฿{totalPaid.toFixed(2)}</Text></Text>
                  <Text style={styles.balanceItem}>ควรจ่ายรวม: <Text style={styles.owedAmount}>฿{totalOwed.toFixed(2)}</Text></Text>
                  <View style={styles.separator} />
                  {balance > 0.01 ? (
                    <Text style={styles.balanceItem}>ยอดคงเหลือ (จะได้รับคืน): <Text style={styles.positiveBalance}>฿{balance.toFixed(2)}</Text></Text>
                  ) : balance < -0.01 ? (
                    <Text style={styles.balanceItem}>ยอดคงเหลือ (ต้องจ่ายเพิ่ม): <Text style={styles.negativeBalance}>฿{Math.abs(balance).toFixed(2)}</Text></Text>
                  ) : (
                    <Text style={styles.balanceItem}>ยอดคงเหลือ: <Text style={styles.evenBalance}>เท่ากันพอดี</Text></Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Transfers (with settle + attach proof) */}
      {items.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.headerShrink]}>สรุปรายการชำระ/โอน</Text>

            <View style={styles.actionsRow}>
              {/* toggle show settled */}
              <TouchableOpacity
                style={[styles.addButton, styles.actionButton, { backgroundColor: showSettled ? '#7f8c8d' : '#3498db' }]}
                onPress={() => setShowSettled((s) => !s)}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>
                  {showSettled ? 'ซ่อนที่ชำระแล้ว' : 'แสดงที่ชำระแล้ว'}
                </Text>
              </TouchableOpacity>

              {/* clear all settled */}
              <TouchableOpacity
                style={[styles.addButton, styles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={onClearAllSettled}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>ล้างสถานะทั้งหมด</Text>
              </TouchableOpacity>
            </View>
          </View>

          {transfers.length ? (
            transfers.map((t) => {
              const isSettled = !!settledMap[t.key];

              const toggleSettle = () => {
                setSettledMap((prev) => {
                  const next = { ...prev };
                  if (next[t.key]) delete next[t.key];
                  else next[t.key] = { note: '' };
                  return next;
                });
              };

              const goAttachProof = () => {
                navigation.navigate('Group4Screen', {
                  groupName: route?.params?.groupData?.groupName || 'กลุ่มของเรา',
                  transferKey: t.key,
                  from: t.from,
                  to: t.to,
                  amount: t.amount,
                });
              };

              return (
                <View key={t.key} style={styles.transferCard}>
                  <Text style={styles.transferText}>
                    <Text style={styles.fromPerson}>{t.from}</Text>
                    {' ต้องโอนให้ '}
                    <Text style={styles.toPerson}>{t.to}</Text>
                    {' จำนวน '}
                    <Text style={styles.transferAmount}>฿{t.amount.toFixed(2)}</Text>
                  </Text>

                  <View style={styles.transferActions}>
                    <CheckBox checked={isSettled} onToggle={toggleSettle} label="ทำเครื่องหมายว่าชำระแล้ว" />

                    <TouchableOpacity onPress={goAttachProof} style={styles.attachButton} activeOpacity={0.8}>
                      <Text style={styles.attachButtonText}>แนบหลักฐาน</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.transferCard}>
              <Text style={styles.transferText}>ไม่มีรายการที่ต้องชำระเพิ่มเติม</Text>
            </View>
          )}
        </View>
      )}

      {/* Modal: Add Person */}
      <Modal transparent animationType="slide" visible={isAddPersonOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มสมาชิกใหม่</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ชื่อสมาชิก"
              value={newPersonName}
              onChangeText={setNewPersonName}
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddPersonOpen(false)}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onAddPerson}>
                <Text style={styles.confirmButtonText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Add Item */}
      <Modal transparent animationType="slide" visible={isAddItemOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มรายการค่าใช้จ่าย</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ชื่อรายการ เช่น ข้าวผัด"
              value={newItemName}
              onChangeText={setNewItemName}
              autoCorrect={false}
            />
            <TextInput
              style={styles.textInput}
              placeholder="ราคา เช่น 50"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddItemOpen(false)}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onAddItem}>
                <Text style={styles.confirmButtonText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

/* =========================================================================
 * 7) STYLES
 * ========================================================================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },

  header: {
    fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#2c3e50',
  },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#7f8c8d' },

  section: {
    marginBottom: 24, backgroundColor: 'white', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  headerShrink: { flexShrink: 1, maxWidth: '100%' },

  addButton: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  actionButton: { marginRight: 8, marginBottom: 8 },

  peopleContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  personChip: {
    backgroundColor: '#ecf0f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', marginRight: 8, marginBottom: 8,
  },
  personName: { fontSize: 14, color: '#34495e', marginRight: 6 },
  removePersonButton: {
    backgroundColor: '#e74c3c', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  removePersonButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold', lineHeight: 16 },

  itemCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2c3e50', flex: 1 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c', marginRight: 12 },
  deleteButton: { backgroundColor: '#e74c3c', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  deleteButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  itemSubtext: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  checkboxContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  checkbox: {
    backgroundColor: '#ecf0f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1,
    borderColor: '#bdc3c7', marginRight: 8, marginBottom: 8,
  },
  checkboxChecked: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  paidByChecked: { backgroundColor: '#e67e22', borderColor: '#d35400' },
  checkboxText: { fontSize: 12, color: '#34495e' },
  checkboxTextChecked: { color: 'white', fontWeight: '600' },
  paidByTextChecked: { color: 'white', fontWeight: '600' },

  shareDetailContainer: { marginTop: 8 },
  shareInfo: { fontSize: 12, color: '#27ae60', fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  shareBreakdown: { backgroundColor: '#f8fffe', padding: 8, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#27ae60' },
  shareBreakdownItem: { fontSize: 11, color: '#2c3e50', marginBottom: 2 },

  balanceCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  personNameLarge: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  balanceDetails: { paddingLeft: 12 },
  balanceItem: { fontSize: 14, color: '#34495e', marginBottom: 4 },
  paidAmount: { fontWeight: 'bold', color: '#3498db' },
  owedAmount: { fontWeight: 'bold', color: '#e67e22' },
  positiveBalance: { fontWeight: 'bold', color: '#27ae60' },
  negativeBalance: { fontWeight: 'bold', color: '#e74c3c' },
  evenBalance: { fontWeight: 'bold', color: '#7f8c8d' },
  separator: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 8 },

  transferCard: { backgroundColor: '#eef8ee', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#27ae60' },
  transferText: { fontSize: 14, color: '#2c3e50' },
  fromPerson: { fontWeight: 'bold', color: '#e74c3c' },
  toPerson: { fontWeight: 'bold', color: '#27ae60' },
  transferAmount: { fontWeight: 'bold', color: '#f39c12', fontSize: 16 },

  // เช็กบ็อกซ์แถว
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, marginRight: 12 },
  checkboxSquare: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#95a5a6',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginRight: 8,
  },
  checkboxSquareOn: { borderColor: '#27ae60', backgroundColor: '#e8f5e8' },
  checkboxTick: { fontSize: 16, color: '#27ae60', fontWeight: '700' },
  checkboxRowLabel: { fontSize: 14, color: '#2c3e50', fontWeight: '600' },

  transferActions: { marginTop: 10, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  attachButton: { backgroundColor: '#8e44ad', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  attachButtonText: { color: '#fff', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },

  modalButtons: { flexDirection: 'row', marginTop: 4 },
  cancelButton: { flex: 1, backgroundColor: '#95a5a6', padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: 'white', fontWeight: '600' },
  confirmButton: { flex: 1, backgroundColor: '#3498db', padding: 12, borderRadius: 8, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontWeight: '600' },
});

export default Group5Screen;
