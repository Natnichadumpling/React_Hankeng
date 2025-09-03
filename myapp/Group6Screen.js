import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

/**
 * Group6Screen
 * อธิบายละเอียด: ใครต้องโอนให้ใคร เท่าไหร่ และมาจากบิลอะไรบ้าง (พร้อมหักลบ)
 * route.params: { groupName, people, items }
 * - items[i] รูปแบบ:
 *   {
 *     id, name, price: number,
 *     paidByMap: { [personName]: number },   // คนออกเงิน (ออกหลายคนได้, ผลรวม=price)
 *     sharedBy: string[]                      // รายชื่อคนหาร
 *   }
 */

const round2 = (x) => Math.round(x * 100) / 100;

// คำนวณ breakdown ระดับ "คู่บุคคล" จากข้อมูลบิล
function useSettlement(routeParams) {
  const { groupName = 'กลุ่มของเรา', people = [], items = [] } = routeParams || {};

  // 1) คำนวณ balance ต่อคน (บวก = ควรได้รับคืน, ลบ = เป็นลูกหนี้)
  const { balances, pairBreakdown } = useMemo(() => {
    const b = {};
    const pair = {}; // key: "from|to" -> { total, items: [{name, amount, info}] }

    const ensure = (k) => {
      if (!pair[k]) pair[k] = { total: 0, items: [] };
      return pair[k];
    };

    // init
    people.forEach((p) => (b[p] = 0));

    items.forEach((it) => {
      const { name, price, sharedBy = [], paidByMap = {} } = it;
      if (!price || !sharedBy.length) return;

      // ส่วนของคนหาร
      const share = price / sharedBy.length;

      // เครดิตให้ผู้จ่าย
      const totalPaid = Object.values(paidByMap).reduce((s, v) => s + (v || 0), 0);
      if (totalPaid <= 0) return;

      // + เพิ่มเครดิตให้ผู้จ่าย
      Object.entries(paidByMap).forEach(([payer, amt]) => {
        if (b[payer] != null) b[payer] += amt;
      });

      // - หนี้ให้คนหาร
      sharedBy.forEach((debtor) => {
        if (b[debtor] != null) b[debtor] -= share;
      });

      // สร้าง breakdown รายคู่อย่าง “สัดส่วนผู้จ่าย”
      Object.entries(paidByMap).forEach(([payer, amt]) => {
        const ratio = (amt || 0) / totalPaid; // สัดส่วนที่ payer ออกจากทั้งบิล
        if (ratio <= 0) return;

        sharedBy.forEach((debtor) => {
          // debtor เป็นหนี้ payer ตามสัดส่วนนี้
          const portion = share * ratio;
          const key = `${debtor}|${payer}`;
          const bucket = ensure(key);

          bucket.total += portion;
          bucket.items.push({
            name,
            amount: portion,
            info: `ราคา ฿${price.toFixed(2)} / หาร ${sharedBy.length} คน (ผู้จ่ายตามสัดส่วน)`,
          });
        });
      });
    });

    // ปัดเศษให้สวยงาม
    Object.keys(b).forEach((k) => (b[k] = round2(b[k])));
    Object.values(pair).forEach((v) => {
      v.total = round2(v.total);
      v.items = v.items.map((x) => ({ ...x, amount: round2(x.amount) }));
    });

    return { balances: b, pairBreakdown: pair };
  }, [people, items]);

  // 2) ทำรายการโอน (ลดจำนวนรายการโดยหักกลบ)
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
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i], c = creditors[j];
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

  return { groupName, people, items, balances, pairBreakdown, transfers };
}

export default function Group6Screen({ route, navigation }) {
  const { groupName, pairBreakdown, transfers } = useSettlement(route?.params);

  // ชำระแล้ว + note
  const [settledMap, setSettledMap] = useState({}); // key: "from|to" -> {note?: string}
  const [showSettled, setShowSettled] = useState(true);
  const [expanded, setExpanded] = useState({}); // key -> true/false

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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <Text style={styles.title}>สรุปรายการโอน</Text>
      <Text style={styles.subtitle}>กลุ่ม: {groupName}</Text>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={() => setShowSettled((s) => !s)}
          style={[styles.ctrlBtn, { backgroundColor: showSettled ? '#ef4444' : '#6b7280' }]}
        >
          <Text style={styles.ctrlBtnText}>{showSettled ? 'ซ่อนรายการที่ชำระแล้ว' : 'แสดงรายการที่ชำระแล้ว'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={expandAll} style={[styles.ctrlBtn, { backgroundColor: '#2563eb' }]}>
          <Text style={styles.ctrlBtnText}>ขยายทั้งหมด</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={collapseAll} style={[styles.ctrlBtn, { backgroundColor: '#374151' }]}>
          <Text style={styles.ctrlBtnText}>ย่อทั้งหมด</Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      {visibleTransfers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.muted}>ไม่มีรายการต้องโอน</Text>
        </View>
      ) : (
        visibleTransfers.map((t) => {
          const key = `${t.from}|${t.to}`;
          const isSettled = !!settledMap[key];
          const pos = pairBreakdown[key] || { total: 0, items: [] };
          const neg = pairBreakdown[`${t.to}|${t.from}`] || { total: 0, items: [] };

          return (
            <View key={key} style={[styles.card, isSettled && styles.cardSettled]}>
              {/* Header line */}
              <Text style={styles.cardTitle}>
                <Text style={styles.nameFrom}>{t.from}</Text>
                <Text> ต้องโอนให้ </Text>
                <Text style={styles.nameTo}>{t.to}</Text>
              </Text>
              <Text style={styles.amount}>฿{t.amount.toFixed(2)}</Text>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => toggleExpand(key)} style={[styles.chip]}>
                  <Text style={styles.chipText}>{expanded[key] ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setSettledMap((m) => {
                      const n = { ...m };
                      if (n[key]) delete n[key];
                      else n[key] = { note: '' };
                      return n;
                    })
                  }
                  style={[styles.chip, isSettled ? styles.chipOn : styles.chipOff]}
                >
                  <Text style={styles.chipText}>{isSettled ? 'ยกเลิกชำระแล้ว' : 'ทำเครื่องหมายว่าชำระแล้ว'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Group4Screen', {
                      groupName,
                      transferKey: key,
                      from: t.from,
                      to: t.to,
                      amount: t.amount,
                    })
                  }
                  style={[styles.chip, { backgroundColor: '#7c3aed' }]}
                >
                  <Text style={styles.chipText}>แนบหลักฐาน</Text>
                </TouchableOpacity>
              </View>

              {/* Detail breakdown */}
              {expanded[key] && (
                <View style={styles.detailBox}>
                  {/* บวก */}
                  <Text style={styles.detailTitle}>มาจากรายการที่ {t.to} ออกให้ {t.from}:</Text>
                  {pos.items.length ? (
                    pos.items.map((it, i) => (
                      <View key={`p-${i}`} style={styles.detailRow}>
                        <Text style={styles.dot}>•</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailName}>{it.name}</Text>
                          <Text style={styles.detailInfo}>{it.info}</Text>
                        </View>
                        <Text style={styles.plus}>+฿{it.amount.toFixed(2)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.muted}>— ไม่มี —</Text>
                  )}

                  {/* ลบ */}
                  {neg.items.length > 0 && <View style={styles.divider} />}
                  {neg.items.length > 0 && (
                    <>
                      <Text style={styles.detailTitle}>
                        หักลบจากรายการที่ {t.from} เคยออกให้ {t.to}:
                      </Text>
                      {neg.items.map((it, i) => (
                        <View key={`n-${i}`} style={styles.detailRow}>
                          <Text style={styles.dot}>•</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailName}>{it.name}</Text>
                            <Text style={styles.detailInfo}>{it.info}</Text>
                          </View>
                          <Text style={styles.minus}>−฿{it.amount.toFixed(2)}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {/* สรุปสมการ */}
                  <View style={styles.equation}>
                    <Text style={styles.muted}>
                      (รวมบวก ฿{pos.total.toFixed(2)}) − (รวมลบ ฿{neg.total.toFixed(2)}) = สุทธิ ฿
                      {(round2(pos.total - neg.total)).toFixed(2)}
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

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 12 },

  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  ctrlBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  ctrlBtnText: { color: '#fff', fontWeight: '700' },

  emptyBox: { padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  muted: { color: '#6b7280' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2,
  },
  cardSettled: { opacity: 0.6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  nameFrom: { color: '#ef4444', fontWeight: '800' },
  nameTo: { color: '#10b981', fontWeight: '800' },
  amount: { position: 'absolute', right: 14, top: 14, fontWeight: '800', color: '#f59e0b' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1f2937' },
  chipOn: { backgroundColor: '#059669' },
  chipOff: { backgroundColor: '#1f2937' },
  chipText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  detailBox: { marginTop: 10, backgroundColor: '#f9fafb', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  detailTitle: { fontWeight: '700', color: '#111827', marginBottom: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  dot: { color: '#9ca3af', marginTop: 2 },
  detailName: { fontWeight: '600', color: '#111827' },
  detailInfo: { color: '#6b7280', fontSize: 12 },
  plus: { color: '#10b981', fontWeight: '800' },
  minus: { color: '#ef4444', fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  equation: { marginTop: 6, alignItems: 'flex-end' },
});
