import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { supabase } from "./supabaseClient";

const round2 = (x) => Math.round(x * 100) / 100;

const useSettlement = (routeParams) => {
  const {
    groupName = "กลุ่มของเรา",
    people = [],
    items = [],
  } = routeParams || {};

  const { balances, pairBreakdown } = useMemo(() => {
    const b = {};
    const pair = {};
    const ensure = (k) => {
      if (!pair[k]) pair[k] = { total: 0, items: [] };
      return pair[k];
    };

    people.forEach((p) => (b[p] = 0));

    items.forEach((it) => {
      const { name, price, sharedBy = [], paidByMap = {} } = it;
      if (!price || !sharedBy.length) return;
      const share = price / sharedBy.length;
      const totalPaid = Object.values(paidByMap).reduce(
        (s, v) => s + (v || 0),
        0
      );
      if (totalPaid <= 0) return;

      Object.entries(paidByMap).forEach(([payer, amt]) => {
        if (b[payer] != null) b[payer] += amt;
      });

      sharedBy.forEach((debtor) => {
        if (b[debtor] != null) b[debtor] -= share;
      });

      Object.entries(paidByMap).forEach(([payer, amt]) => {
        const ratio = (amt || 0) / totalPaid;
        if (ratio <= 0) return;
        sharedBy.forEach((debtor) => {
          const portion = share * ratio;
          const key = `${debtor}|${payer}`;
          const bucket = ensure(key);
          bucket.total += portion;
          bucket.items.push({
            name,
            amount: portion,
            info: `ราคา ฿${price.toFixed(2)} / หาร ${
              sharedBy.length
            } คน (ผู้จ่ายตามสัดส่วน)`,
          });
        });
      });
    });

    Object.keys(b).forEach((k) => (b[k] = round2(b[k])));
    Object.values(pair).forEach((v) => {
      v.total = round2(v.total);
      v.items = v.items.map((x) => ({ ...x, amount: round2(x.amount) }));
    });

    return { balances: b, pairBreakdown: pair };
  }, [people, items]);

  const transfers = useMemo(() => {
    const debtors = [];
    const creditors = [];
    Object.entries(balances).forEach(([name, val]) => {
      if (val < -0.01) debtors.push({ name, amount: Math.abs(val) });
      else if (val > 0.01) creditors.push({ name, amount: val });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const list = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i],
        c = creditors[j];
      const amt = Math.min(d.amount, c.amount);
      if (amt > 0.01) {
        list.push({ from: d.name, to: c.name, amount: round2(amt) });
      }
      d.amount -= amt;
      c.amount -= amt;
      if (d.amount < 0.01) i++;
      if (c.amount < 0.01) j++;
    }
    return list;
  }, [balances]);

  return { groupName, balances, pairBreakdown, transfers };
};

export default function Group6Screen({ route, navigation }) {
  const allItems = route?.params?.items || [];
  const people = route?.params?.people || [];
  const groupName = route?.params?.groupName || "กลุ่มของเรา";
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null);
  const [peopleBankInfo, setPeopleBankInfo] = useState({});

  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserEmail(user.email);
        
        
        const { data: profile } = await supabase
          .from('users') 
          .select('name')
          .eq('email', user.email)
          .single();
        
        if (profile && profile.name) {
          setCurrentUserDisplayName(profile.name);
          console.log('Current User Name:', profile.name); 
        }
      }
    };
    fetchCurrentUser();
  }, []);

  
  useEffect(() => {
    const fetchPeopleBankInfo = async () => {
      if (people.length === 0) return;

      console.log('Fetching bank info for:', people); 

      
      const { data: profiles, error } = await supabase
        .from('users')
        .select('name, bank_name, bank_account')
        .in('name', people);

      if (error) {
        console.error('Error fetching bank info:', error);
        return;
      }

      if (profiles) {
        const bankMap = {};
        profiles.forEach(profile => {
          bankMap[profile.name] = {
            bank_name: profile.bank_name,
            bank_account: profile.bank_account
          };
        });
        setPeopleBankInfo(bankMap);
        console.log('Bank Info Loaded:', bankMap);
      }
    };
    fetchPeopleBankInfo();
  }, [people]);

  const filteredItems = selectedItem
    ? allItems.filter((it) => it.name === selectedItem)
    : allItems;

  const { pairBreakdown, transfers } = useSettlement({
    groupName,
    people,
    items: filteredItems,
  });

  const [settledMap, setSettledMap] = useState({});
  const [showSettled, setShowSettled] = useState(true);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (k) => setExpanded((s) => ({ ...s, [k]: !s[k] }));

  const expandAll = () => {
    const m = {};
    transfers.forEach((t) => (m[`${t.from}|${t.to}`] = true));
    setExpanded(m);
  };

  const collapseAll = () => setExpanded({});

  const visibleTransfers = transfers.filter((t) => {
    const k = `${t.from}|${t.to}`;
    const isSettled = !!settledMap[k];
    return showSettled ? true : !isSettled;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={styles.title}>สรุปรายการโอน</Text>
      <Text style={styles.subtitle}>กลุ่ม: {groupName}</Text>

      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>เลือกรายการ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setSelectedItem(null)}
            style={[
              styles.filterBtn,
              selectedItem === null && styles.filterBtnOn,
            ]}
          >
            <Text style={styles.filterBtnText}>ทั้งหมด</Text>
          </TouchableOpacity>
          {allItems.map((it, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedItem(it.name)}
              style={[
                styles.filterBtn,
                selectedItem === it.name && styles.filterBtnOn,
              ]}
            >
              <Text style={styles.filterBtnText}>{it.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => setShowSettled((s) => !s)}
          style={[
            styles.ctrlBtn,
            { backgroundColor: showSettled ? "#7fccecff" : "#6b7280" },
          ]}
        >
          <Text style={styles.ctrlBtnText}>
            {showSettled ? "ซ่อนรายการที่ชำระแล้ว" : "แสดงรายการที่ชำระแล้ว"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={expandAll}
          style={[styles.ctrlBtn, { backgroundColor: "#7fccecff" }]}
        >
          <Text style={styles.ctrlBtnText}>ขยายทั้งหมด</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={collapseAll}
          style={[styles.ctrlBtn, { backgroundColor: "#7fccecff" }]}
        >
          <Text style={styles.ctrlBtnText}>ย่อทั้งหมด</Text>
        </TouchableOpacity>
      </View>

      {visibleTransfers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.muted}>ไม่มีรายการต้องโอน</Text>
        </View>
      ) : (
        visibleTransfers.map((t) => {
          const key = `${t.from}|${t.to}`;
          const isSettled = !!settledMap[key];
          const pos = pairBreakdown[key] || { total: 0, items: [] };
          const neg = pairBreakdown[`${t.to}|${t.from}`] || {
            total: 0,
            items: [],
          };

        
          const receiverBankInfo = peopleBankInfo[t.to] || {};
          
          console.log(`Transfer: ${t.from} → ${t.to}`, receiverBankInfo); 

          return (
            <View key={key} style={[styles.card, isSettled && styles.cardSettled]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLine}>
                  <Text style={{fontWeight: 'normal'}}>{t.from}</Text>
                  <Text> ต้องจ่ายให้ </Text>
                  <Text style={{fontWeight: 'normal'}}>{t.to}</Text>
                  <Text> จำนวน ฿{t.amount.toFixed(2)}</Text>
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Group4Screen", {
                      groupName,
                      from: t.from,
                      to: t.to,
                      amount: t.amount,
                      groupId: route?.params?.groupId,
                      userId: route?.params?.userId,
                    })
                  }
                  style={styles.evidenceBtn}
                >
                  <Text style={styles.evidenceText}>แนบหลักฐาน</Text>
                </TouchableOpacity>
              </View>

              {receiverBankInfo && (receiverBankInfo.bank_name || receiverBankInfo.bank_account) && (
                <View style={styles.bankInfoBox}>
                  <Text style={styles.bankInfoTitle}>ข้อมูลบัญชีของ {t.to}:</Text>
                  {receiverBankInfo.bank_name && (
                    <Text style={styles.bankInfoText}>
                      🏦 ธนาคาร: {receiverBankInfo.bank_name}
                    </Text>
                  )}
                  {receiverBankInfo.bank_account && (
                    <Text style={styles.bankInfoText}>
                      💳 เลขบัญชี: {receiverBankInfo.bank_account}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>
                  <Text style={styles.nameFrom}>{t.from}</Text>
                  <Text> → </Text>
                  <Text style={styles.nameTo}>{t.to}</Text>
                </Text>
                <Text style={styles.amount}>฿{t.amount.toFixed(2)}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => toggleExpand(key)}
                  style={[styles.chip]}
                >
                  <Text style={styles.chipText}>
                    {expanded[key] ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setSettledMap((m) => {
                      const n = { ...m };
                      if (n[key]) delete n[key];
                      else n[key] = { note: "" };
                      return n;
                    })
                  }
                  style={[
                    styles.chip,
                    isSettled ? styles.chipOn : styles.chipOff,
                  ]}
                >
                  <Text style={styles.chipText}>
                    {isSettled ? "ยกเลิกชำระแล้ว" : "ทำเครื่องหมายว่าชำระแล้ว"}
                  </Text>
                </TouchableOpacity>
              </View>

              {expanded[key] && (
                <View style={styles.detailBox}>
                  <Text style={styles.detailTitle}>
                    มาจากบิลที่ {t.to} ออกให้ {t.from}:
                  </Text>
                  {pos.items.length ? (
                    pos.items.map((it, i) => (
                      <View key={`p-${i}`} style={styles.detailRow}>
                        <Text style={styles.dot}>•</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailName}>{it.name}</Text>
                          <Text style={styles.detailInfo}>{it.info}</Text>
                        </View>
                        <Text style={styles.plus}>
                          +฿{it.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.muted}>— ไม่มี —</Text>
                  )}

                  {neg.items.length > 0 && <View style={styles.divider} />}

                  {neg.items.length > 0 && (
                    <>
                      <Text style={styles.detailTitle}>
                        หักลบจากบิลที่ {t.from} เคยออกให้ {t.to}:
                      </Text>
                      {neg.items.map((it, i) => (
                        <View key={`n-${i}`} style={styles.detailRow}>
                          <Text style={styles.dot}>•</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailName}>{it.name}</Text>
                            <Text style={styles.detailInfo}>{it.info}</Text>
                          </View>
                          <Text style={styles.minus}>
                            −฿{it.amount.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}

                  <View style={styles.equation}>
                    <Text style={styles.muted}>
                      (รวมบวก ฿{pos.total.toFixed(2)}) − (รวมลบ ฿
                      {neg.total.toFixed(2)}) = สุทธิ ฿
                      {round2(pos.total - neg.total).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 12 },
  filterBox: { marginBottom: 12 },
  filterLabel: { fontWeight: "700", marginBottom: 6, color: "#111827" },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    marginRight: 6,
  },
  filterBtnOn: { backgroundColor: "#7bd1a1ff" },
  filterBtnText: { color: "#111827", fontWeight: "700" },
  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  ctrlBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  ctrlBtnText: { color: "#fff", fontWeight: "700" },
  emptyBox: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  muted: { color: "#6b7280" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardSettled: { opacity: 0.6 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLine: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000ff",
    flex: 1,
    marginRight: 8,
  },
  evidenceBtn: {
    backgroundColor: "#7fccecff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  evidenceText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  bankInfoBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  bankInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
  },
  bankInfoText: {
    fontSize: 13,
    color: "#065f46",
    fontWeight: "600",
    marginBottom: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  nameFrom: { color: "#fe8d8dff", fontWeight: "800" },
  nameTo: { color: "#10b981", fontWeight: "800" },
  amount: { fontWeight: "800", color: "#f59e0b" },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1f2937",
  },
  chipOn: { backgroundColor: "#059669" },
  chipOff: { backgroundColor: "#1f2937" },
  chipText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  detailBox: {
    marginTop: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailTitle: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6,
  },
  dot: { color: "#9ca3af", marginTop: 2 },
  detailName: { fontWeight: "600", color: "#111827" },
  detailInfo: { color: "#6b7280", fontSize: 12 },
  plus: { color: "#10b981", fontWeight: "800" },
  minus: { color: "#fe8d8dff", fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  equation: { marginTop: 6, alignItems: "flex-end" },
});