// Group5Screen.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';

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
const syncReceipts = (receiptByPayer, nextPayers) => {
  const next = {};
  nextPayers.forEach((n) => { next[n] = receiptByPayer?.[n] ?? null; });
  return next;
};

const DEFAULT_GROUP = { groupName: 'กลุ่มของเรา', members: ['คุณ', 'เพื่อน A', 'เพื่อน B'] };

/* ===== Small UI bits ===== */
const NetBadge = ({ net }) => {
  if (Math.abs(net) < 0.01) return <Text style={[styles.badge, styles.badgeGrey]}>เท่ากันพอดี</Text>;
  if (net > 0) return <Text style={[styles.badge, styles.badgeGreen]}>รับคืน ฿{net.toFixed(2)}</Text>;
  return <Text style={[styles.badge, styles.badgeRed]}>ต้องจ่าย ฿{Math.abs(net).toFixed(2)}</Text>;
};

const PersonCard = ({ name, paidTotal, oweTotal, paidItems, owedItems, expanded, onToggle }) => {
  const net = round2(paidTotal - oweTotal);
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHead} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.personTitle}>{name}</Text>
        <NetBadge net={net} />
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>ออกให้กลุ่ม</Text>
        <Text style={styles.rowValue}>฿{paidTotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>ส่วนที่ต้องรับผิดชอบ</Text>
        <Text style={styles.rowValue}>฿{oweTotal.toFixed(2)}</Text>
      </View>

      {expanded && (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>รายการที่จ่ายให้กลุ่ม</Text>
          {paidItems.length ? (
            paidItems.map((it, i) => (
              <Text key={`p-${i}`} style={styles.dot}>• {it.itemName}: ฿{it.amount.toFixed(2)}</Text>
            ))
          ) : (
            <Text style={styles.muted}>— ไม่มี —</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.detailTitle}>รายละเอียดที่ควรจ่าย</Text>
          {owedItems.length ? (
            owedItems.map((it, i) => (
              <Text key={`o-${i}`} style={styles.dot}>• {it.itemName}: ฿{it.share.toFixed(2)}</Text>
            ))
          ) : (
            <Text style={styles.muted}>— ไม่มี —</Text>
          )}
        </View>
      )}
    </View>
  );
};

/* ===== Main Screen ===== */
export default function Group5Screen({ navigation }) {
  const route = useRoute();
  const groupName = route?.params?.groupName || DEFAULT_GROUP.groupName;
  const nav = useNavigation(); // Add navigation hook

  const [people, setPeople] = useState(route?.params?.members || DEFAULT_GROUP.members);
  // item = {id, name, price, paidByMap, sharedBy, receiptByPayer: { [payer]: uri|null }}
  const [items, setItems] = useState([]);

  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const [editPayersOpen, setEditPayersOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [editAmounts, setEditAmounts] = useState({});

  const [expandedMap, setExpandedMap] = useState({});

  /* ===== Summary per person ===== */
  const summary = useMemo(() => {
    const balances = {}, shouldPayDetail = {}, paidDetail = {};
    people.forEach((p) => { balances[p] = 0; shouldPayDetail[p] = []; paidDetail[p] = []; });

    items.forEach(({ price, name, sharedBy = [], paidByMap = {} }) => {
      const n = sharedBy.length; if (!n) return;
      const share = price / n;
      Object.entries(paidByMap).forEach(([payer, amt]) => {
        if (!(payer in balances)) return;
        balances[payer] += amt;
        paidDetail[payer].push({ itemName: name, amount: amt });
      });
      sharedBy.forEach((person) => {
        if (!(person in balances)) return;
        balances[person] -= share;
        shouldPayDetail[person].push({ itemName: name, share });
      });
    });
    return { balances, shouldPayDetail, paidDetail };
  }, [items, people]);

  /* ===== Handlers: people ===== */
  const onAddPerson = () => {
    const name = newPersonName.trim(); if (!name) return;
    setPeople((p) => [...p, name]); setNewPersonName(''); setIsAddPersonOpen(false);
  };

  const onRemovePerson = (person) => {
    if (people.length <= 1) {
      Alert.alert('ไม่สามารถลบได้', 'ต้องมีสมาชิกอย่างน้อย 1 คน');
      return;
    }
    Alert.alert('ยืนยันการลบ', `ลบ "${person}" ออกจากกลุ่มและรายการทั้งหมด`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ตกลง',
        onPress: () => {
          setPeople((prev) => prev.filter((p) => p !== person));
          setItems((prev) => prev.map((it) => {
            const nextPaid = { ...(it.paidByMap || {}) }; delete nextPaid[person];
            const nextShare = (it.sharedBy || []).filter((p) => p !== person);
            const nextReceipts = { ...(it.receiptByPayer || {}) };
            delete nextReceipts[person];
            return { ...it, paidByMap: nextPaid, sharedBy: nextShare, receiptByPayer: nextReceipts };
          }));
        }
      },
    ]);
  };

  /* ===== Handlers: items ===== */
  const onAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);
    if (!name || !newItemPrice.trim() || isNaN(price) || price <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่ชื่อรายการและราคาที่ถูกต้อง');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        price: round2(price),
        paidByMap: { คุณ: round2(price) },
        sharedBy: [],
        receiptByPayer: { คุณ: null }, // 1 รูป/คน/รายการ
      },
    ]);
    setNewItemName(''); setNewItemPrice(''); setIsAddItemOpen(false);
  };

  const onRemoveItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  // เลือกผู้จ่าย (หลายคน) -> แบ่งยอดเท่ากัน + ซิงก์ receiptByPayer
  const onTogglePayer = (itemId, person) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== itemId) return it;
      const selected = Object.entries(it.paidByMap || {})
        .filter(([, a]) => a > 0.0001)
        .map(([n]) => n);

      let next = selected.includes(person)
        ? (selected.length === 1 ? selected : selected.filter((n) => n !== person))
        : [...selected, person];
      if (!next.length) next = ['คุณ'];

      return {
        ...it,
        paidByMap: evenSplitMap(it.price, next),
        receiptByPayer: syncReceipts(it.receiptByPayer, next),
      };
    }));
  };

  // เปิดหน้าต่างแก้ไขยอดผู้จ่าย
  const openEditPayers = (item) => {
    const map = item.paidByMap || {};
    const selected = Object.entries(map).filter(([, a]) => a > 0.0001).map(([n]) => n);
    const init = selected.length ? map : { คุณ: item.price };
    const asStr = {}; Object.entries(init).forEach(([n, a]) => (asStr[n] = String(a)));
    setEditItemId(item.id); setEditAmounts(asStr); setEditPayersOpen(true);
  };

  const confirmEditPayers = () => {
    const price = items.find((it) => it.id === editItemId)?.price || 0;
    const parsed = {}; let sum = 0;
    Object.entries(editAmounts).forEach(([n, v]) => {
      const val = parseFloat(v);
      if (!isNaN(val) && val > 0) { parsed[n] = round2(val); sum += round2(val); }
    });
    if (Math.abs(sum - price) > 0.009) {
      Alert.alert('ยอดไม่ตรง', `ยอดรวมผู้จ่ายต้องเท่ากับราคา ฿${price.toFixed(2)} (ตอนนี้รวมได้ ฿${sum.toFixed(2)})`);
      return;
    }
    const nextPayers = Object.keys(parsed);
    setItems((prev) =>
      prev.map((it) =>
        it.id === editItemId
          ? { ...it, paidByMap: parsed, receiptByPayer: syncReceipts(it.receiptByPayer, nextPayers) }
          : it
      )
    );
    setEditPayersOpen(false); setEditItemId(null); setEditAmounts({});
  };

  // เลือกคนที่ต้องหาร
  const onToggleSharedBy = (itemId, person) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== itemId) return it;
      const on = (it.sharedBy || []).includes(person);
      return { ...it, sharedBy: on ? it.sharedBy.filter((p) => p !== person) : [...it.sharedBy, person] };
    }));
  };

  /* ===== แนบ/ลบสลิปต่อ "ผู้จ่าย" ในแต่ละรายการ ===== */
  const attachReceipt = async (itemId, payerName) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ต้องการสิทธิ์', 'โปรดอนุญาตเข้าถึงรูปภาพเพื่อแนบสลิป');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const next = { ...(it.receiptByPayer || {}) };
        next[payerName] = uri;
        return { ...it, receiptByPayer: next };
        })
    );
  };

  const removeReceipt = (itemId, payerName) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const next = { ...(it.receiptByPayer || {}) };
        next[payerName] = null;
        return { ...it, receiptByPayer: next };
      })
    );
  };

  /* ===== ไปหน้าสรุปรายการ (Group6) ===== */
  const goSummary = () => {
    navigation.navigate('Group6Screen', { groupName: groupName, people, items });
  };

  /* ===== UI ===== */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()}>
        <Text style={styles.backButtonText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      <Text style={styles.header}>{groupName}</Text>
      <Text style={styles.subHeader}>จัดรายการ + สรุปยอดต่อคน</Text>

      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#10b981' }]} onPress={goSummary}>
          <Text style={styles.primaryBtnText}>หน้าสรุปรายการ</Text>
        </TouchableOpacity>
      </View>

      {/* Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>สมาชิก ({people.length})</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsAddPersonOpen(true)}>
            <Text style={styles.primaryBtnText}>+ เพิ่มคน</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.peopleWrap}>
          {people.map((person) => (
            <View key={person} style={styles.personChip}>
              <Text style={styles.personText}>{person}</Text>
              <TouchableOpacity onPress={() => onRemovePerson(person)} style={styles.personRemove}>
                <Text style={styles.personRemoveText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการ ({items.length})</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsAddItemOpen(true)}>
            <Text style={styles.primaryBtnText}>+ เพิ่มรายการ</Text>
          </TouchableOpacity>
        </View>

        {items.map((item) => {
          const perHead = (item.sharedBy?.length || 0) > 0 ? (item.price / item.sharedBy.length).toFixed(2) : null;
          const selectedPayers = Object.entries(item.paidByMap || {})
            .filter(([, a]) => a > 0.0001)
            .map(([n]) => n);
          const payerSummary = selectedPayers
            .map((n) => `${n}: ฿${(item.paidByMap[n] || 0).toFixed(2)}`)
            .join(', ');

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHead}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>฿{item.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helpText}>จ่ายโดย (เลือกได้หลายคน):</Text>
              <View style={styles.wrapRow}>
                {people.map((p) => {
                  const on = selectedPayers.includes(p);
                  return (
                    <TouchableOpacity
                      key={`${item.id}-payer-${p}`}
                      onPress={() => onTogglePayer(item.id, p)}
                      style={[styles.chip, on && styles.chipPayerOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                <Text style={styles.helpText}>ยอดที่ออกจริง: </Text>
                <Text style={styles.helpTextStrong}>{payerSummary || '-'}</Text>
              </View>

              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#8e44ad' }]} onPress={() => openEditPayers(item)}>
                <Text style={styles.smallBtnText}>แก้ไขยอดผู้จ่าย</Text>
              </TouchableOpacity>

              <Text style={[styles.helpText, { marginTop: 10 }]}>คนที่ต้องหาร:</Text>
              <View style={styles.wrapRow}>
                {people.map((p) => {
                  const on = (item.sharedBy || []).includes(p);
                  return (
                    <TouchableOpacity
                      key={`${item.id}-share-${p}`}
                      onPress={() => onToggleSharedBy(item.id, p)}
                      style={[styles.chip, on && styles.chipShareOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {perHead && (
                <View style={styles.breakdownBox}>
                  <Text style={styles.breakdownTitle}>หาร {item.sharedBy.length} คน = ฿{perHead}/คน</Text>
                  {item.sharedBy.map((p) => (
                    <Text key={`${item.id}-${p}`} style={styles.dot}>• {p}: ฿{perHead}</Text>
                  ))}
                </View>
              )}

              {/* แนบสลิป/ใบเสร็จ: 1 รูป/ผู้จ่าย */}
              <View style={styles.receiptBox}>
                <Text style={styles.receiptTitle}>แนบสลิป/ใบเสร็จ (ผูกกับผู้จ่ายแต่ละคน)</Text>

                {selectedPayers.length === 0 ? (
                  <Text style={styles.muted}>— ยังไม่มีผู้จ่าย —</Text>
                ) : (
                  selectedPayers.map((payer) => {
                    const uri = item.receiptByPayer?.[payer] || null;
                    return (
                      <View key={`${item.id}-receipt-${payer}`} style={styles.receiptLine}>
                        <View style={styles.payerTag}>
                          <Text style={styles.payerTagText}>{payer}</Text>
                        </View>

                        {!uri ? (
                          <TouchableOpacity
                            style={[styles.btn, styles.btnPurple]}
                            onPress={() => attachReceipt(item.id, payer)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.btnText}>เลือกภาพ</Text>
                          </TouchableOpacity>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[styles.btn, styles.btnPurple, { marginRight: 8 }]}
                              onPress={() => attachReceipt(item.id, payer)}
                            >
                              <Text style={styles.btnText}>เปลี่ยนภาพ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.btn, styles.btnGrey, { marginRight: 8 }]}
                              onPress={() => removeReceipt(item.id, payer)}
                            >
                              <Text style={styles.btnText}>ลบรูป</Text>
                            </TouchableOpacity>
                            <Image source={{ uri }} style={styles.receiptThumb} />
                          </>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* สรุปต่อคน */}
      {items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สรุปยอดแต่ละคน</Text>
          {people
            .slice()
            .sort((a, b) => (summary.balances[a] || 0) - (summary.balances[b] || 0))
            .map((person) => {
              const paidItems = (summary.paidDetail[person] || []).map((it) => ({ ...it, amount: round2(it.amount) }));
              const owedItems = summary.shouldPayDetail[person] || [];
              const paidTotal = paidItems.reduce((s, it) => s + it.amount, 0);
              const oweTotal = owedItems.reduce((s, it) => s + it.share, 0);

              return (
                <PersonCard
                  key={`sum-${person}`}
                  name={person}
                  paidTotal={paidTotal}
                  oweTotal={oweTotal}
                  paidItems={paidItems}
                  owedItems={owedItems}
                  expanded={!!expandedMap[person]}
                  onToggle={() => setExpandedMap((m) => ({ ...m, [person]: !m[person] }))}
                />
              );
            })}
        </View>
      )}

      {/* ---------- Modals ---------- */}
      {/* Add Person */}
      <Modal transparent animationType="slide" visible={isAddPersonOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มสมาชิกใหม่</Text>
            <TextInput style={styles.input} placeholder="ชื่อสมาชิก" value={newPersonName} onChangeText={setNewPersonName} />
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnGrey]} onPress={() => setIsAddPersonOpen(false)}>
                <Text style={styles.modalBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnBlue]} onPress={onAddPerson}>
                <Text style={styles.modalBtnText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Item */}
      <Modal transparent animationType="slide" visible={isAddItemOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มรายการค่าใช้จ่าย</Text>
            <TextInput style={styles.input} placeholder="ชื่อรายการ เช่น kfc" value={newItemName} onChangeText={setNewItemName} />
            <TextInput style={styles.input} placeholder="ราคา เช่น 160" keyboardType="numeric" value={newItemPrice} onChangeText={setNewItemPrice} />
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.btnGrey]} onPress={() => setIsAddItemOpen(false)}>
                <Text style={styles.modalBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnBlue]} onPress={onAddItem}>
                <Text style={styles.modalBtnText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit payers */}
      <Modal transparent animationType="fade" visible={editPayersOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>แก้ไขยอดผู้จ่าย</Text>
            <Text style={styles.muted}>ใส่ยอดที่ออกจริงของแต่ละคน (ผลรวมต้องเท่ากับราคาของรายการ)</Text>

            {Object.keys(editAmounts).length ? (
              Object.entries(editAmounts).map(([name, val]) => (
                <View key={`edit-${name}`} style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 6, color: '#111827' }}>{name}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(val)}
                    onChangeText={(t) => setEditAmounts((prev) => ({ ...prev, [name]: t }))}
                  />
                </View>
              ))
            ) : (
              <Text style={[styles.muted, { marginTop: 8 }]}>ยังไม่มีผู้จ่าย</Text>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {people.map((p) => {
                const on = Object.prototype.hasOwnProperty.call(editAmounts, p);
                return (
                  <TouchableOpacity
                    key={`toggle-${p}`}
                    style={[styles.chip, on && styles.chipPayerOn, { marginBottom: 8 }]}
                    onPress={() =>
                      setEditAmounts((prev) => {
                        const n = { ...prev };
                        if (on) delete n[p];
                        else n[p] = '0';
                        return n;
                      })
                    }
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGrey]}
                onPress={() => { setEditPayersOpen(false); setEditItemId(null); setEditAmounts({}); }}
              >
                <Text style={styles.modalBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.btnBlue]} onPress={confirmEditPayers}>
                <Text style={styles.modalBtnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f5f5f5', padding:16 },
  header:{ fontSize:24, fontWeight:'700', color:'#111827', textAlign:'center' },
  subHeader:{ fontSize:14, color:'#6b7280', textAlign:'center', marginBottom:12 },

  section:{ backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:14, elevation:2 },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  sectionTitle:{ fontSize:16, fontWeight:'700', color:'#1f2937' },

  primaryBtn:{ backgroundColor:'#2563eb', paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontWeight:'700' },

  peopleWrap:{ flexDirection:'row', flexWrap:'wrap' },
  personChip:{ flexDirection:'row', alignItems:'center', backgroundColor:'#eef2ff', borderRadius:20, paddingHorizontal:12, paddingVertical:6, marginRight:8, marginBottom:8 },
  personText:{ color:'#1e293b' },
  personRemove:{ width:18, height:18, borderRadius:9, backgroundColor:'#ef4444', alignItems:'center', justifyContent:'center', marginLeft:6 },
  personRemoveText:{ color:'#fff', fontWeight:'700', lineHeight:18 },

  itemCard:{ backgroundColor:'#f9fafb', borderRadius:10, padding:12, marginBottom:10, borderWidth:1, borderColor:'#e5e7eb' },
  itemHead:{ flexDirection:'row', alignItems:'center', marginBottom:6 },
  itemName:{ flex:1, fontSize:16, fontWeight:'600', color:'#111827' },
  itemPrice:{ fontWeight:'700', color:'#ef4444', marginRight:8 },
  deleteBtn:{ width:24, height:24, borderRadius:12, backgroundColor:'#ef4444', alignItems:'center', justifyContent:'center' },
  deleteBtnText:{ color:'#fff', fontWeight:'700' },

  helpText:{ color:'#374151', fontSize:12 },
  helpTextStrong:{ color:'#111827', fontSize:12, fontWeight:'600' },

  wrapRow:{ flexDirection:'row', flexWrap:'wrap', marginTop:6, marginBottom:6 },
  chip:{ borderWidth:1, borderColor:'#c7d2fe', backgroundColor:'#eef2ff', paddingHorizontal:10, paddingVertical:6, borderRadius:999, marginRight:6 },
  chipText:{ color:'#374151', fontSize:12 },
  chipTextOn:{ color:'#fff', fontWeight:'700' },
  chipPayerOn:{ backgroundColor:'#f59e0b', borderColor:'#d97706' },
  chipShareOn:{ backgroundColor:'#2563eb', borderColor:'#1d4ed8' },

  smallBtn:{ alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  smallBtnText:{ color:'#fff', fontWeight:'700', fontSize:12 },

  breakdownBox:{ marginTop:6, backgroundColor:'#effdf7', borderLeftWidth:3, borderLeftColor:'#1ba275ff', padding:8, borderRadius:6 },
  breakdownTitle:{ color:'#08644aff', fontSize:12, fontWeight:'600', marginBottom:4 },
  dot:{ color:'#374151', fontSize:12, marginBottom:2 },

  /* person summary */
  card:{ backgroundColor:'#fff', borderRadius:12, padding:12, marginTop:10 },
  cardHead:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  personTitle:{ fontSize:16, fontWeight:'700', color:'#1f2937' },
  row:{ flexDirection:'row', justifyContent:'space-between', marginVertical:2 },
  rowLabel:{ color:'#374151' },
  rowValue:{ color:'#111827', fontWeight:'600' },
  detailBox:{ backgroundColor:'#f9fafb', borderRadius:8, padding:10, marginTop:8 },
  detailTitle:{ fontWeight:'700', color:'#111827', marginBottom:6 },
  muted:{ color:'#9ca3af' },
  divider:{ height:1, backgroundColor:'#e5e7eb', marginVertical:8 },

  /* badges */
  badge:{ paddingHorizontal:10, paddingVertical:4, borderRadius:999, color:'#fff', fontWeight:'800' },
  badgeGreen:{ backgroundColor:'#2a9423ff' },
  badgeRed:{ backgroundColor:'#ef4444' },
  badgeGrey:{ backgroundColor:'#6b7280' },

  /* modal */
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center' },
  modalContent:{ backgroundColor:'#fff', borderRadius:16, padding:18, width:'88%', maxWidth:420 },
  modalTitle:{ fontSize:18, fontWeight:'700', color:'#111827', marginBottom:8, textAlign:'center' },
  input:{ borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, padding:10, fontSize:16, marginTop:8 },
  modalRow:{ flexDirection:'row', marginTop:12 },
  modalBtn:{ flex:1, padding:12, borderRadius:10, alignItems:'center' },
  btnGrey:{ backgroundColor:'#e8ecf4ff', marginRight:8 },
  btnBlue:{ backgroundColor:'#61c3ffff' },

  /* receipts */
  receiptBox:{ marginTop:8, backgroundColor:'#f8f9ff', padding:10, borderRadius:8, borderWidth:1, borderColor:'#e5e7eb' },
  receiptTitle:{ fontSize:12, color:'#1f2937', fontWeight:'700', marginBottom:6 },
  receiptLine:{ flexDirection:'row', alignItems:'center', marginBottom:8, flexWrap:'wrap' },
  payerTag:{ backgroundColor:'#eef2ff', borderColor:'#c7d2fe', borderWidth:1, paddingHorizontal:10, paddingVertical:6, borderRadius:999, marginRight:8 },
  payerTagText:{ color:'#374151', fontSize:12, fontWeight:'700' },
  receiptThumb:{ width:60, height:60, borderRadius:8 },

  btn:{ paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  btnPurple:{ backgroundColor:'#148cdce3' },
  btnText:{ color:'#fff', fontWeight:'700' },

  /* Back button and tab header */
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
