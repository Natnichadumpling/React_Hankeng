import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabaseClient";

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
  groupName: "กลุ่มของเรา",
  members: ["คุณ", "เพื่อน A", "เพื่อน B"],
};

export default function Group5Screen() {
  const route = useRoute();
  const nav = useNavigation();

  const groupName = route?.params?.groupName || DEFAULT_GROUP.groupName;
  const [currentUserName, setCurrentUserName] = useState("คุณ");
  const [people, setPeople] = useState(
    route?.params?.members || DEFAULT_GROUP.members
  );
  const [items, setItems] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [newPersonName, setNewPersonName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editPayersOpen, setEditPayersOpen] = useState(false);

  const [editItemId, setEditItemId] = useState(null);
  const [editSelected, setEditSelected] = useState([]);
  const [editAmounts, setEditAmounts] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single();
        if (profile && profile.name) {
          setCurrentUserName(profile.name);
          setPeople((prev) => prev.map((p) => (p === "คุณ" ? profile.name : p)));
          setItems((prev) => prev.map((item) => ({
            ...item,
            paidByMap: Object.fromEntries(
              Object.entries(item.paidByMap || {}).map(([k, v]) => [k === "คุณ" ? profile.name : k, v])
            ),
            sharedBy: (item.sharedBy || []).map((p) => p === "คุณ" ? profile.name : p),
          })));
        }
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select('name, bank_name, bank_account')
        .order('name');
      if (!error && users) setAvailableUsers(users);
    };
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(`items:${groupName}`).then(
      (stored) => stored && setItems(JSON.parse(stored))
    );
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(`items:${groupName}`, JSON.stringify(items));
  }, [items]);

  const onAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) { Alert.alert("ผิดพลาด", "กรุณาเลือกสมาชิก"); return; }
    if (people.includes(name)) { Alert.alert("ซ้ำ", "มีชื่อนี้อยู่ในกลุ่มแล้ว"); return; }
    setPeople((p) => [...p, name]);
    setNewPersonName("");
    setIsAddPersonOpen(false);
  };

  const onAddItem = () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);
    if (!name || isNaN(price) || price <= 0) { Alert.alert("ผิดพลาด", "ใส่ชื่อและราคาที่ถูกต้อง"); return; }
    const newItem = { id: Date.now(), name, price: round2(price), paidByMap: { [currentUserName]: round2(price) }, sharedBy: [] };
    setItems((prev) => [newItem, ...prev]);
    setNewItemName(""); setNewItemPrice(""); setIsAddItemOpen(false);
  };

  const onRemoveItem = (id) => {
    Alert.alert("ยืนยัน", "ลบรายการนี้?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => setItems((prev) => prev.filter((it) => it.id !== id)) },
    ]);
  };

  const onRemovePerson = (person) => {
    if (person === currentUserName) { Alert.alert("ไม่สามารถลบได้", "คุณไม่สามารถลบตัวเองออกจากกลุ่มได้"); return; }
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบ ${person} ออกจากกลุ่มหรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => setPeople((prev) => prev.filter((p) => p !== person)) },
    ]);
  };

  const openEditPayers = (item) => {
    const current = Object.entries(item.paidByMap || {}).filter(([, a]) => a > 0.001).map(([n]) => n);
    setEditItemId(item.id);
    setEditSelected(current.length ? current : [currentUserName]);
    const next = {};
    (current.length ? current : [currentUserName]).forEach((n) => {
      next[n] = String(item.paidByMap?.[n] ?? (n === currentUserName ? item.price : 0));
    });
    setEditAmounts(next); setEditPayersOpen(true);
  };

  const toggleEditPayer = (name) => {
    setEditSelected((prev) => {
      const on = prev.includes(name);
      if (on) { const next = prev.filter((n) => n !== name); const amounts = { ...editAmounts }; delete amounts[name]; setEditAmounts(amounts); return next; }
      else { setEditAmounts({ ...editAmounts, [name]: "" }); return [...prev, name]; }
    });
  };

  const setEvenSplit = (price, names) => {
    const m = evenSplitMap(price, names); const next = {}; names.forEach((n) => (next[n] = String(m[n] ?? 0))); setEditAmounts(next);
  };

  const saveEditPayers = () => {
    const item = items.find((it) => it.id === editItemId); if (!item) return;
    let sum = 0; editSelected.forEach((n) => { sum += parseFloat(editAmounts[n] || "0") || 0; });
    const diff = round2(sum - item.price); if (Math.abs(diff) > 0.01) { Alert.alert("ยอดไม่ตรง", `รวมผู้จ่าย ฿${sum.toFixed(2)} ไม่ตรงกับราคา ฿${item.price.toFixed(2)}`); return; }
    const nextPaid = {}; editSelected.forEach((n) => { const v = round2(parseFloat(editAmounts[n] || "0") || 0); if (v > 0) nextPaid[n] = v; });
    setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, paidByMap: nextPaid } : it));
    setEditPayersOpen(false);
  };

  const goSummary = () => {
    const updatedPeople = people.map(p => p === "คุณ" ? currentUserName : p);
    const updatedItems = items.map(item => ({
      ...item,
      paidByMap: Object.fromEntries(Object.entries(item.paidByMap || {}).map(([k, v]) => [k === "คุณ" ? currentUserName : k, v])),
      sharedBy: (item.sharedBy || []).map(p => p === "คุณ" ? currentUserName : p),
    }));
    nav.navigate("Group6Screen", { groupName, people: updatedPeople, items: updatedItems });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>{groupName}</Text>
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <TouchableOpacity style={styles.primaryBtn} onPress={goSummary}>
          <Text style={styles.primaryBtnText}>ไปหน้าสรุปรายการ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สมาชิก ({people.length})</Text>
        <View style={styles.peopleWrap}>
          {people.map((person) => (
            <View key={person} style={styles.personChip}>
              <Text style={styles.personText}>{person}</Text>
              {person !== currentUserName && (
                <TouchableOpacity onPress={() => onRemovePerson(person)} style={styles.personRemove}>
                  <Text style={styles.personRemoveText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 8 }]} onPress={() => setIsAddPersonOpen(true)}>
          <Text style={styles.primaryBtnText}>+ เพิ่มคน</Text>
        </TouchableOpacity>
      </View>
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
            .join(", ");

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
                    <Text key={p}>
                      • {p}: ฿{perHead}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Modal transparent animationType="slide" visible={isAddPersonOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือกสมาชิกจาก Database</Text>
            {availableUsers.length === 0 ? (
              <Text style={styles.emptyText}>ไม่พบข้อมูลสมาชิกในระบบ</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {availableUsers
                  .filter(u => !people.includes(u.name))
                  .map((user) => (
                    <TouchableOpacity
                      key={user.name}
                      onPress={() => setNewPersonName(user.name)}
                      style={[
                        styles.userOption,
                        newPersonName === user.name && styles.userOptionSelected
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userOptionName}>{user.name}</Text>
                        {user.bank_name && (
                          <Text style={styles.userOptionBank}>
                            🏦 {user.bank_name} {user.bank_account ? `• ${user.bank_account}` : ''}
                          </Text>
                        )}
                      </View>
                      {newPersonName === user.name && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGrey]}
                onPress={() => {
                  setNewPersonName("");
                  setIsAddPersonOpen(false);
                }}
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

      <Modal transparent animationType="slide" visible={editPayersOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(() => {
              const it = items.find((x) => x.id === editItemId);
              const price = it?.price || 0;
              const sum = editSelected.reduce(
                (s, n) => s + (parseFloat(editAmounts[n] || "0") || 0),
                0
              );
              const diff = round2(sum - price);

              return (
                <>
                  <Text style={styles.modalTitle}>กำหนดผู้จ่าย</Text>
                  <Text>รายการ: {it?.name} | ราคา ฿{price.toFixed(2)}</Text>

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
                              {on ? "✓" : ""}
                            </Text>
                          </TouchableOpacity>
                          <Text style={{ flex: 1 }}>{p}</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { width: 80, textAlign: "right", marginTop: 0 },
                              !on && { opacity: 0.4 },
                            ]}
                            placeholder="0.00"
                            keyboardType="numeric"
                            editable={on}
                            value={on ? String(editAmounts[p] ?? "") : ""}
                            onChangeText={(t) =>
                              setEditAmounts((m) => ({ ...m, [p]: t }))
                            }
                          />
                        </View>
                      );
                    })}
                  </View>

                  <Text style={{ marginTop: 6, color: Math.abs(diff) < 0.01 ? "green" : "red" }}>
                    รวมที่ระบุ: ฿{sum.toFixed(2)} {Math.abs(diff) < 0.01 ? "✓" : `(ต่างจากราคา ${diff.toFixed(2)})`}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F9F2",
    padding: 16
  },
  
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#37A36B"
  },

  section: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#37A36B"
  },

  peopleWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },

  personChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F9F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6
  },

  personText: {
    fontWeight: "600",
    color: "#37A36B"
  },

  personRemove: {
    marginLeft: 8,
    backgroundColor: "#EF4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },

  personRemoveText: {
    color: "#fff",
    fontWeight: "700"
  },

  primaryBtn: {
    backgroundColor: "#b9e3f7ff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },

  primaryBtnText: {
    color: "#101010ff",
    fontWeight: "700"
  },

  itemCard: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  itemHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  },

  itemName: {
    flex: 1,
    fontWeight: "700",
    color: "#37A36B"
  },

  itemPrice: {
    fontWeight: "700",
    color: "#DC2626",
    marginRight: 8
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },

  deleteBtnText: {
    color: "#fff",
    fontWeight: "700"
  },

  chip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6
  },

  chipOn: {
    backgroundColor: "#b9e3f7ff",
    borderColor: "#b9e3f7ff"
  },

  chipText: {
    fontSize: 12
  },

  chipTextOn: {
    color: "#181717ff",
    fontWeight: "700"
  },

  breakdownBox: {
    marginTop: 6,
    backgroundColor: "#EFFDF7",
    padding: 6,
    borderRadius: 6
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "88%",
    maxHeight: "80%"
  },

  modalTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    color: "#37A36B"
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    marginTop: 6
  },

  modalRow: {
    flexDirection: "row",
    marginTop: 10
  },

  modalBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4
  },

  btnGrey: {
    backgroundColor: "#D1D5DB"
  },

  btnBlue: {
    backgroundColor: "#3B82F6"
  },

  btnDark: {
    backgroundColor: "#111827"
  },

  btnText: {
    color: "#fff",
    fontWeight: "700"
  },

  payerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center"
  },

  checkboxOn: {
    backgroundColor: "#3B82F6"
  },

  checkboxText: {
    color: "#fff",
    fontWeight: "700"
  },

  userOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center"
  },

  userOptionSelected: {
    backgroundColor: "#D8F5FF"
  },

  userOptionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2
  },

  userOptionBank: {
    fontSize: 12,
    color: "#6B7280"
  },

  checkMark: {
    fontSize: 20,
    color: "#3B82F6",
    fontWeight: "700"
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    padding: 20
  }
});

