import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

const API_URL =
  "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_R8PxpJWiO0qlvgzzhE7UKsiO2Pgbdw1ZQ53KK9Vl&currencies=THB&base_currency=USD";

const Group4Screen = ({ navigation, route }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(""); // 'THB' | 'USD'
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);

  const [rateTHB, setRateTHB] = useState(null); // จำนวนบาทต่อ 1 USD
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(null);

  const {
    groupName: gNameFromNav,
    transferKey,
    from,
    to,
    amount: amountParam,
  } = route?.params || {};
  const groupName = gNameFromNav || route?.params?.groupName || "กลุ่มของเรา";
  const groupId = route?.params?.groupId;
  const userId = route?.params?.userId;

  const isSendDisabled = selectedImages.length === 0 && !messageText.trim();

  // โหลดข้อความแชทจากฐานข้อมูล Supabase
  useEffect(() => {
    const fetchMessagesAndExpenses = async () => {
      if (!groupId) {
        console.log("fetchMessagesAndExpenses: groupId is missing");
        return;
      }
      console.log(
        "Fetching messages, expenses, and images for groupId:",
        groupId
      );
      setIsLoadingMessages(true);
      setMessagesError(null);

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("group_messages")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Error fetching messages:", messagesError.message);
          setMessagesError(messagesError.message);
        } else {
          setChatMessages(
            messagesData.map((msg) => ({
              type: msg.type,
              uri: msg.image_url || msg.content,
              userId: msg.sender_email,
              createdAt: msg.created_at,
              messageId: msg.id,
              messageText: msg.content || msg.messageText || "",
            }))
          );
        }

        const { data: expensesData, error: expensesError } = await supabase
          .from("group_expenses")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: true });

        if (expensesError) {
          console.error("Error fetching expenses:", expensesError.message);
        } else {
          console.log("Fetched expenses:", expensesData);
          setExpenses(expensesData);
        }

        const { data: imagesData, error: imagesError } = await supabase
          .from("group_images")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: true });

        if (imagesError) {
          console.error("Error fetching images:", imagesError.message);
        } else {
          console.log("Fetched images:", imagesData);
          setSelectedImages(imagesData.map((img) => img.image_url));
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessagesAndExpenses();

    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Screen focused, refreshing data...");
      fetchMessagesAndExpenses();
    });

    return unsubscribe;
  }, [groupId, navigation]);

  useEffect(() => {
    if (!groupId) return;

    console.log("🔄 Setting up realtime subscription for group:", groupId);

    const channel = supabase
      .channel(`group_messages_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log("📡 New message received via realtime:", payload);

          const newMessage = {
            type: payload.new.type || "text",
            userId: payload.new.sender_email,
            createdAt: payload.new.created_at,
            messageId: payload.new.id,
            messageText: "",
            uri: null,
          };

          if (payload.new.type === "image") {
            newMessage.uri = payload.new.image_url;
            newMessage.messageText =
              payload.new.content || payload.new.message || "";
            console.log("🖼️ Realtime image message:", {
              id: payload.new.id,
              image_url: payload.new.image_url,
              content: payload.new.content,
            });
          } else {
            newMessage.messageText =
              payload.new.content || payload.new.message || "";
          }

          setChatMessages((prevMessages) => {
            const updated = [...prevMessages, newMessage];
            console.log("📝 Updated chat messages:", updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Unsubscribing from realtime channel");
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const uploadImageToSupabase = async (uri) => {
    try {
      console.log("📤 Starting image upload:", uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop() || "jpg";
      const fileName = `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const filePath = `chat_images/${fileName}`;
      console.log("📁 Upload path:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful:", uploadData);

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-images").getPublicUrl(filePath);

      console.log("🔗 Generated public URL:", publicUrl);

      if (!publicUrl) {
        throw new Error("ไม่สามารถสร้าง public URL ได้");
      }

      const { data, error } = await supabase.from("group_images").insert([
        {
          group_id: groupId,
          user_id: userId,
          image_url: publicUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("❌ Database error:", error);
        throw error;
      }

      console.log("✅ Image metadata saved to database:", data);

      return publicUrl;
    } catch (err) {
      console.error("❌ Upload failed:", err);
      Alert.alert("อัปโหลดรูปไม่สำเร็จ", err.message || "เกิดข้อผิดพลาด");
      return null;
    }
  };

  const fetchRateIfNeeded = async () => {
    if (rateTHB !== null || isLoadingRate) return;
    try {
      setIsLoadingRate(true);
      setRateError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const thb = json && json.data && json.data.THB;
      if (typeof thb !== "number")
        throw new Error("Invalid response: THB missing");
      setRateTHB(thb);
    } catch (e) {
      setRateError(e?.message || "โหลดอัตราแลกเปลี่ยนไม่สำเร็จ");
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleSendMessage = async () => {
    if (!groupId || !userId) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่พบข้อมูลกลุ่มหรือผู้ใช้");
      return;
    }

    const hasText = messageText.trim();
    const hasImages = selectedImages.length > 0;

    if (!hasText && !hasImages) return;

    console.log("📨 Sending message...", {
      hasText: !!hasText,
      hasImages,
      imageCount: selectedImages.length,
      text: hasText,
    });

    try {
      if (hasText && !hasImages) {
        console.log("📝 Sending text message...");
        const insertData = {
          group_id: groupId,
          sender_email: userId,
          type: "text",
          content: hasText,
          message: hasText,
        };

        console.log("💾 Text insert data:", insertData);

        const { data, error } = await supabase
          .from("group_messages")
          .insert([insertData])
          .select();

        if (error) {
          console.error("❌ Database error for text:", error);
          Alert.alert("เกิดข้อผิดพลาด", error.message);
          return;
        }

        console.log("✅ Text message saved:", data);
        setMessageText("");
      }

      if (hasImages) {
        console.log("🖼️ Sending image messages...");
        for (let i = 0; i < selectedImages.length; i++) {
          const uri = selectedImages[i];
          console.log(
            `📤 Uploading image ${i + 1}/${selectedImages.length}:`,
            uri
          );

          const publicUrl = await uploadImageToSupabase(uri);
          if (!publicUrl) {
            console.error("❌ Failed to upload image, skipping...");
            continue;
          }

          const insertData = {
            group_id: groupId,
            sender_email: userId,
            type: "image",
            content: hasText || "",
            message: hasText || "",
            image_url: publicUrl,
          };

          console.log("💾 Image insert data:", insertData);

          const { data, error } = await supabase
            .from("group_messages")
            .insert([insertData])
            .select();

          if (error) {
            console.error("❌ Database error for image:", error);
            Alert.alert("เกิดข้อผิดพลาด", error.message);
            return;
          }

          console.log("✅ Image message saved:", data);
        }

        setSelectedImages([]);
        setMessageText("");
      }
    } catch (error) {
      console.error("❌ Send message error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถส่งข้อความได้");
    }
  };

  const handleAddExpense = async (expenseDetails) => {
    if (!groupId || !userId) {
      Alert.alert("Error", "Group or user information is missing.");
      return;
    }

    try {
      const { amount, description } = expenseDetails;
      console.log("Adding expense:", { amount, description });

      const { data, error } = await supabase.from("group_expenses").insert([
        {
          group_id: groupId,
          user_id: userId,
          amount,
          description,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error adding expense:", error);
        Alert.alert("Error", "Failed to add expense.");
        return;
      }

      console.log("Expense added successfully:", data);
      Alert.alert("Success", "Expense added successfully.");

      fetchMessages();
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const addGroupExpense = async (expense) => {
    if (!groupId) {
      Alert.alert("Error", "Group ID is missing.");
      return;
    }

    try {
      const { name, price } = expense;
      console.log("Adding expense:", { name, price });

      const { data, error } = await supabase.from("group_items").insert([
        {
          group_id: groupId,
          name,
          price,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error adding expense:", error.message);
        Alert.alert("Error", "Failed to add expense.");
        return;
      }

      console.log("Expense added successfully:", data);
      Alert.alert("Success", "Expense added successfully.");

      fetchGroupExpenses();
    } catch (err) {
      console.error("Unexpected error while adding expense:", err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while adding expense."
      );
    }
  };

  const goBack = () => navigation.goBack();

  const handleImageSelect = async () => {
    setShowImagePicker(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log("📷 Image picker result:", res);

      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        const newImageUri = res.assets[0].uri;
        setSelectedImages((prev) => {
          const updated = [...prev, newImageUri];
          console.log("🖼️ Updated selected images:", updated);
          return updated;
        });
        Alert.alert("เลือกรูปภาพ", "เลือกรูปภาพแล้ว");
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ภาพได้");
      }
    } catch (err) {
      console.error("❌ Image picker error:", err);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ภาพได้");
    }
  };

  const openCurrencyTool = async () => {
    setShowToolsModal(false);
    setShowCurrencyModal(true);
    await fetchRateIfNeeded();
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setConvertedAmount(null);

    if (currency === "THB" && from && to && amountParam) {
      setAmount(Number(amountParam || 0).toFixed(2));
    }

    if (currency === "USD" && rateTHB) {
      const thbAmount = Number(amountParam || 0);
      const usdAmount = thbAmount / rateTHB;
      setAmount(usdAmount.toFixed(2));
    }
  };

  const handleConvertCurrency = () => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    if (!rateTHB) {
      Alert.alert("ข้อผิดพลาด", "ยังไม่สามารถโหลดอัตราแลกเปลี่ยนได้");
      return;
    }

    let result = null;
    if (selectedCurrency === "THB") {
      result = n / rateTHB;
    } else if (selectedCurrency === "USD") {
      result = n * rateTHB;
    }
    setConvertedAmount(result);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const rateBanner = useMemo(() => {
    if (isLoadingRate) return "กำลังโหลดอัตราแลกเปลี่ยน...";
    if (rateError) return `โหลดอัตราแลกเปลี่ยนไม่สำเร็จ: ${rateError}`;
    if (rateTHB) return `อัตราล่าสุด: 1 USD ≈ ${rateTHB.toFixed(4)} THB`;
    return "ยังไม่มีอัตราแลกเปลี่ยน";
  }, [isLoadingRate, rateError, rateTHB]);

  console.log("🔍 Current state:", {
    groupId,
    userId,
    chatMessagesCount: chatMessages.length,
    selectedImagesCount: selectedImages.length,
    isLoadingMessages,
  });

  return (
    <ImageBackground
      source={require("./assets/images/p1.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>ย้อนกลับ </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("Group2Screen", { groupName })}
          >
            <Text style={styles.menuText}>เชิญเพื่อน</Text>
          </TouchableOpacity>
        </View>
        {(from || to) && (
          <View style={styles.transferInfo}>
            <Text style={styles.transferInfoText}>
              รายการ: {from} โอนให้{to} จำนวน ฿
              {Number(amountParam || 0).toFixed(2)}
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ref={(ref) => {
            if (ref && chatMessages.length > 0) {
              setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
            }
          }}
        >
          {isLoadingMessages ? (
            <ActivityIndicator
              size="large"
              color="#4a90e2"
              style={{ marginTop: 40 }}
            />
          ) : messagesError ? (
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatText}>
                เกิดข้อผิดพลาด: {messagesError}
              </Text>
            </View>
          ) : (
            <>
              {chatMessages.map((msg, idx) => (
                <View
                  key={`${msg.messageId || idx}`}
                  style={[
                    styles.chatBubble,
                    msg.userId === userId
                      ? styles.chatBubbleRight
                      : styles.chatBubbleLeft,
                  ]}
                >
                  {msg.type === "image" ? (
                    <View>
                      <Image
                        source={{ uri: msg.uri }}
                        style={styles.chatImage}
                      />
                      <Text style={styles.chatUploader}>
                        อัปโหลดโดย: {msg.userId === userId ? "คุณ" : msg.userId}
                      </Text>
                      {msg.messageText && (
                        <Text style={styles.chatImageCaption}>
                          {msg.messageText}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.chatText}>{msg.messageText}</Text>
                  )}
                  <Text style={styles.timestamp}>
                    {new Date(msg.createdAt).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}

              {expenses && expenses.length > 0 && (
                <View style={styles.expensesContainer}>
                  <Text style={styles.expensesTitle}>รายการค่าใช้จ่าย:</Text>
                  {expenses.map((expense, index) => (
                    <View key={index} style={styles.expenseItem}>
                      <Text style={styles.expenseDescription}>
                        {expense.name}
                      </Text>
                      <Text style={styles.expenseAmount}>
                        ฿{expense.price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {selectedImages.length > 0 && (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.selectedImagesTitle}>
                รูปภาพที่เลือก ({selectedImages.length}):
              </Text>
              {selectedImages.map((uri, index) => (
                <View key={`selected-${index}`} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowToolsModal(true)}
          >
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendDisabled && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={isSendDisabled}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showImagePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เพิ่มไฟล์ภาพ</Text>
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleImageSelect}
                >
                  <Text style={styles.imagePickerIcon}>📷</Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                  <Image
                    source={{ uri: selectedImages[selectedImages.length - 1] }}
                    style={styles.imagePickerPreview}
                  />
                )}
              </View>
              <Text style={styles.cameraText}>เลือกไฟล์ภาพ</Text>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={styles.modalCancelText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showToolsModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เครื่องมือ</Text>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={openCurrencyTool}
              >
                <Text style={styles.modalOptionText}>💱 แปลงสกุลเงิน</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowToolsModal(false)}
              >
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCurrencyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>แปลงสกุลเงิน</Text>

              <View style={styles.rateBannerContainer}>
                {isLoadingRate ? (
                  <ActivityIndicator />
                ) : (
                  <Text
                    style={[
                      styles.rateBanner,
                      { color: rateError ? "#d32f2f" : "#333" },
                    ]}
                  >
                    {rateBanner}
                  </Text>
                )}
              </View>

              <Text style={styles.currencyLabel}>
                จำนวนเงินที่ต้องจ่าย(สกุลเงิน):
              </Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedCurrency === "THB" && styles.chipActive,
                  ]}
                  onPress={() => handleCurrencySelect("THB")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCurrency === "THB" && styles.chipTextActive,
                    ]}
                  >
                    THB
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedCurrency === "USD" && styles.chipActive,
                  ]}
                  onPress={() => handleCurrencySelect("USD")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCurrency === "USD" && styles.chipTextActive,
                    ]}
                  >
                    USD
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.currencyInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  setConvertedAmount(null);
                }}
                editable={!isLoadingRate && !rateError}
              />

              <TouchableOpacity
                style={[
                  styles.convertButton,
                  (!amount ||
                    !selectedCurrency ||
                    isLoadingRate ||
                    rateError) &&
                    styles.convertButtonDisabled,
                ]}
                onPress={handleConvertCurrency}
                disabled={
                  !amount || !selectedCurrency || isLoadingRate || rateError
                }
              >
                <Text style={styles.convertButtonText}>แปลง</Text>
              </TouchableOpacity>

              {convertedAmount !== null && selectedCurrency && (
                <Text style={styles.convertResult}>
                  ผลลัพธ์:{" "}
                  {selectedCurrency === "THB"
                    ? `${convertedAmount.toFixed(2)} USD`
                    : `${convertedAmount.toFixed(2)} THB`}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.modalCancelButton, styles.currencyCloseButton]}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={styles.modalCancelText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 16,
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e8f4fd",
    borderRadius: 15,
  },
  menuText: {
    fontSize: 14,
    color: "#4a90e2",
  },
  transferInfo: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff8e1",
  },
  transferInfoText: {
    color: "#6d4c41",
    fontSize: 13,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  emptyChatContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  emptyChatSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  chatBubble: {
    borderRadius: 18,
    padding: 12,
    marginVertical: 4,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  chatBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "#4a90e2",
    marginLeft: "20%",
  },
  chatBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    marginRight: "20%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chatText: {
    fontSize: 16,
    lineHeight: 20,
  },
  chatTextRight: {
    color: "#fff",
  },
  chatTextLeft: {
    color: "#333",
  },
  chatImage: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "bold",
  },
  imagePlaceholderSubtext: {
    color: "#999",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  chatUploader: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  chatImageCaption: {
    fontSize: 15,
    color: "#333",
    marginTop: 6,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
  },
  selectedImagesContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedImagesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  imagePreview: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    position: "relative",
    alignItems: "center",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  iconButton: {
    padding: 10,
    marginRight: 6,
  },
  iconText: {
    fontSize: 22,
    color: "#666",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalCancelButton: {
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  imagePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fafafa",
    minWidth: 160,
    justifyContent: "center",
    marginBottom: 15,
  },
  imagePickerButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 50,
  },
  imagePickerIcon: {
    fontSize: 30,
    color: "#333",
  },
  imagePickerPreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 15,
    backgroundColor: "#eee",
  },
  cameraText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  rateBannerContainer: {
    marginBottom: 15,
    alignItems: "center",
  },
  rateBanner: {
    fontSize: 14,
    textAlign: "center",
  },
  currencyLabel: {
    marginBottom: 10,
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  chipContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  chipText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  currencyInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  convertButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  convertButtonDisabled: {
    opacity: 0.5,
  },
  convertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  convertResult: {
    fontSize: 16,
    color: "#333",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
  },
  currencyCloseButton: {
    marginTop: 20,
  },
  expensesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  expensesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  expenseDescription: {
    fontSize: 14,
    color: "#333",
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
  },
});

export default Group4Screen;
