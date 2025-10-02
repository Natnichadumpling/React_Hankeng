// Group5Screen.js
import React, { useEffect, useState } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ===== Utilities ===== */
const round2 = (x) => Math.round(x * 100) / 100;

const evenSplitMap = (total, names) => {
  const n = names.length;
  if (!n) return {};

  const cents = Math.round(total * 100);
  const base = Math.floor(cents / n);
  let rem = cents - base * n;

  const res = {};
  names.forEach((name) => {
    const add = rem > 0 ? 1 : 0;
    res[name] = (base + add) / 100;
    if (rem > 0) rem -= 1;
  });

  return res;
};

const DEFAULT_GROUP = {
  groupName: 'กลุ่มของเรา',
  members: ['คุณ', 'เพื่อน A', 'เพื่อน B'],
};

/* ===== Main Screen ===== */
export default function Group5Screen() {
  const route = useRoute();
  const nav = useNavigation();

  const groupName = route?.params?.groupName || DEFAULT_GROUP.groupName;
  const [people, setPeople] = useState(
    route?.params?.members || DEFAULT_GROUP.members
  );
  const [items, setItems] = useState([]);

  // new inputs
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // modal states
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editPayersOpen, setEditPayersOpen] = useState(false);

  // edit payers
  const [editItemId, setEditItemId] = useState(null);
  const [editSelected, setEditSelected] = useState([]);
  const [editAmounts, setEditAmounts] = useState({});

  /* ===== Storage ===== */
  useEffect(() => {
    AsyncStorage
      .getItem(`items:${groupName}`)
      .then((stored) => stored && setItems(JSON.parse(stored)));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(`items:${groupName}`, JSON.stringify(items));
  }, [items]);

  /* ===== Handlers ===== */
  const onAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;

    if (people.includes(name)) {
      Alert.alert('ซ้ำ', 'มีชื่อนี้อยู่แล้ว');
      return;
    }

    setPeople((p) => [...p, name]);
    setNewPersonName('');
    setIsAddPersonOpen(false);
  };

  const onAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);

    if (!name || isNaN(price) || price <= 0) {
      Alert.alert('ผิดพลาด', 'ใส่ชื่อและราคาที่ถูกต้อง');
      return;
    }

    const newItem = {
      id: Date.now(),
      name,
      price: round2(price),
      paidByMap: { คุณ: round2(price) },
      sharedBy: [],
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemPrice('');
    setIsAddItemOpen(false);
  };

  const onRemoveItem = (id) => {
    Alert.alert('ยืนยัน', 'ลบรายการนี้?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: () => setItems((prev) => prev.filter((it) => it.id !== id)),
      },
    ]);
  };

  /* ===== Edit payers ===== */
  const openEditPayers = (item) => {
    const current = Object.entries(item.paidByMap || {})
      .filter(([, a]) => a > 0.001)
      .map(([n]) => n);

    setEditItemId(item.id);
    setEditSelected(current.length ? current : ['คุณ']);

    const next = {};
    (current.length ? current : ['คุณ']).forEach((n) => {
      next[n] = String(item.paidByMap?.[n] ?? (n === 'คุณ' ? item.price : 0));
    });
    setEditAmounts(next);
    setEditPayersOpen(true);
  };

  const toggleEditPayer = (name) => {
    setEditSelected((prev) => {
      const on = prev.includes(name);
      if (on) {
        const next = prev.filter((n) => n !== name);
        const amounts = { ...editAmounts };
        delete amounts[name];
        setEditAmounts(amounts);
        return next;
      } else {
        setEditAmounts({ ...editAmounts, [name]: '' });
        return [...prev, name];
      }
    });
  };

  const setEvenSplit = (price, names) => {
    const m = evenSplitMap(price, names);
    const next = {};
    names.forEach((n) => (next[n] = String(m[n] ?? 0)));
    setEditAmounts(next);
  };

  const saveEditPayers = () => {
    const item = items.find((it) => it.id === editItemId);
    if (!item) return;

    let sum = 0;
    editSelected.forEach((n) => {
      sum += parseFloat(editAmounts[n] || '0') || 0;
    });
    const diff = round2(sum - item.price);

    if (Math.abs(diff) > 0.01) {
      Alert.alert(
        'ยอดไม่ตรง',
        `รวมผู้จ่าย ฿${sum.toFixed(2)} ไม่ตรงกับราคา ฿${item.price.toFixed(2)}`
      );
      return;
    }

    const nextPaid = {};
    editSelected.forEach((n) => {
      const v = round2(parseFloat(editAmounts[n] || '0') || 0);
      if (v > 0) nextPaid[n] = v;
    });

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, paidByMap: nextPaid } : it
      )
    );
    setEditPayersOpen(false);
  };

  const goSummary = () => {
    nav.navigate('Group6Screen', { groupName, people, items });
  };

  /* ===== Render ===== */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>{groupName}</Text>

      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity style={styles.primaryBtn} onPress={goSummary}>
          <Text style={styles.primaryBtnText}>ไปหน้าสรุปรายการ</Text>
        </TouchableOpacity>
      </View>

      {/* Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สมาชิก ({people.length})</Text>
        <View style={styles.peopleWrap}>
          {people.map((person) => (
            <View key={person} style={styles.personChip}>
              <Text style={styles.personText}>{person}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: 8 }]}
          onPress={() => setIsAddPersonOpen(true)}
        >
          <Text style={styles.primaryBtnText}>+ เพิ่มคน</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>รายการ ({items.length})</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { marginBottom: 12 }]}
          onPress={() => setIsAddItemOpen(true)}
        >
          <Text style={styles.primaryBtnText}>+ เพิ่มรายการ</Text>
        </TouchableOpacity>

        {items.map((item) => {
          const perHead =
            (item.sharedBy?.length || 0) > 0
              ? (item.price / item.sharedBy.length).toFixed(2)
              : null;

          const payerSummary = Object.entries(item.paidByMap || {})
            .map(([n, v]) => `${n}: ฿${v.toFixed(2)}`)
            .join(', ');

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHead}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>฿{item.price.toFixed(2)}</Text>
                <TouchableOpacity
                  onPress={() => onRemoveItem(item.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text>ผู้จ่าย: {payerSummary}</Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 6 }]}
                onPress={() => openEditPayers(item)}
              >
                <Text style={styles.primaryBtnText}>แก้ไขผู้จ่าย</Text>
              </TouchableOpacity>

              <Text style={{ marginTop: 6 }}>คนที่ต้องหาร:</Text>
              <View style={styles.peopleWrap}>
                {people.map((p) => {
                  const on = (item.sharedBy || []).includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id
                              ? {
                                  ...it,
                                  sharedBy: on
                                    ? it.sharedBy.filter((q) => q !== p)
                                    : [...it.sharedBy, p],
                                }
                              : it
                          )
                        )
                      }
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {perHead && (
                <View style={styles.breakdownBox}>
                  <Text>
                    หาร {item.sharedBy.length} คน = ฿{perHead}/คน
                  </Text>
                  {item.sharedBy.map((p) => (
                    <Text key={p}>• {p}: ฿{perHead}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Modal: Add person */}
      <Modal transparent animationType="slide" visible={isAddPersonOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มสมาชิกใหม่</Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่อสมาชิก"
              value={newPersonName}
              onChangeText={setNewPersonName}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGrey]}
                onPress={() => setIsAddPersonOpen(false)}
              >
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnBlue]}
                onPress={onAddPerson}
              >
                <Text style={styles.btnText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Add item */}
      <Modal transparent animationType="slide" visible={isAddItemOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มรายการ</Text>
            <TextInput
              style={styles.input}
              placeholder="ชื่อรายการ"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="ราคา"
              keyboardType="numeric"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGrey]}
                onPress={() => setIsAddItemOpen(false)}
              >
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnBlue]}
                onPress={onAddItem}
              >
                <Text style={styles.btnText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Edit payers */}
      <Modal transparent animationType="slide" visible={editPayersOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(() => {
              const it = items.find((x) => x.id === editItemId);
              const price = it?.price || 0;
              const sum = editSelected.reduce(
                (s, n) => s + (parseFloat(editAmounts[n] || '0') || 0),
                0
              );
              const diff = round2(sum - price);

              return (
                <>
                  <Text style={styles.modalTitle}>กำหนดผู้จ่าย</Text>
                  <Text>
                    รายการ: {it?.name} | ราคา ฿{price.toFixed(2)}
                  </Text>

                  <View style={{ marginTop: 8 }}>
                    {people.map((p) => {
                      const on = editSelected.includes(p);
                      return (
                        <View key={p} style={styles.payerRow}>
                          <TouchableOpacity
                            style={[styles.checkbox, on && styles.checkboxOn]}
                            onPress={() => toggleEditPayer(p)}
                          >
                            <Text style={styles.checkboxText}>
                              {on ? '✓' : ''}
                            </Text>
                          </TouchableOpacity>
                          <Text style={{ flex: 1 }}>{p}</Text>
                          <TextInput
                            style={[
                              styles.input,
                              {
                                width: 80,
                                textAlign: 'right',
                                marginTop: 0,
                              },
                              !on && { opacity: 0.4 },
                            ]}
                            placeholder="0.00"
                            keyboardType="numeric"
                            editable={on}
                            value={on ? String(editAmounts[p] ?? '') : ''}
                            onChangeText={(t) =>
                              setEditAmounts((m) => ({ ...m, [p]: t }))
                            }
                          />
                        </View>
                      );
                    })}
                  </View>

                  <Text
                    style={{
                      marginTop: 6,
                      color: Math.abs(diff) < 0.01 ? 'green' : 'red',
                    }}
                  >
                    รวมที่ระบุ: ฿{sum.toFixed(2)}{' '}
                    {Math.abs(diff) < 0.01
                      ? '✓'
                      : `(ต่างจากราคา ${diff.toFixed(2)})`}
                  </Text>

                  <View style={styles.modalRow}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.btnGrey]}
                      onPress={() => setEditPayersOpen(false)}
                    >
                      <Text style={styles.btnText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.btnDark]}
                      onPress={() => setEvenSplit(price, editSelected)}
                    >
                      <Text style={styles.btnText}>เฉลี่ย</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.btnBlue]}
                      onPress={saveEditPayers}
                    >
                      <Text style={styles.btnText}>บันทึก</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  section: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  peopleWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  personChip: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 6, marginBottom: 6 },
  personText: { fontWeight: '600' },
  primaryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  itemCard: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  itemHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemName: { flex: 1, fontWeight: '700' },
  itemPrice: { fontWeight: '700', color: '#dc2626', marginRight: 8 },
  deleteBtn: { backgroundColor: '#ef4444', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700' },
  chip: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  chipOn: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
  chipText: { fontSize: 12 },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  breakdownBox: { marginTop: 6, backgroundColor: '#effdf7', padding: 6, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '88%' },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginTop: 6 },
  modalRow: { flexDirection: 'row', marginTop: 10 },
  modalBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  btnGrey: { backgroundColor: '#d1d5db' },
  btnBlue: { backgroundColor: '#2563eb' },
  btnDark: { backgroundColor: '#111827' },
  btnText: { color: '#fff', fontWeight: '700' },
  payerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#9ca3af', marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#2563eb' },
  checkboxText: { color: '#fff', fontWeight: '700' },
});