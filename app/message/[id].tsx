import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import TickIcon from "@/assets/icons/icons/tick-outline-white.svg";
import DoubleTickIcon from "@/assets/icons/icons/tick-double-outline-white.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import {
  getMessages,
  getThreads,
  markAsRead,
  Message,
  sendMessage,
  Thread,
} from "@/lib/messages";
import { getAccessToken, getStoredUser, StoredUser } from "@/lib/session";

const fallbackAvatar = require("@/assets/images/landing/landing-1.jpg");

export default function MessageDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [partner, setPartner] = useState<Thread | null>(null);
  const [me, setMe] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const fetchMatchAndMessages = useCallback(async () => {
    try {
      const sessionToken = await getAccessToken();
      const currentUser = await getStoredUser();
      if (!sessionToken || !matchId) return;

      setToken(sessionToken);
      setMe(currentUser);

      const [threads, msgsResponse] = await Promise.all([
        getThreads(sessionToken),
        getMessages(sessionToken, matchId, { limit: 50 }),
      ]);

      const currentThread = threads.find((t) => t.matchId === matchId);
      if (currentThread) {
        setPartner(currentThread);
        
        // Mark as read only if there are unread messages AND the last message is from the partner
        if (
          currentThread.lastMessage?.id && 
          currentThread.unreadCount > 0 && 
          currentThread.lastMessage.authorProfileId === currentThread.profile.id
        ) {
          markAsRead(sessionToken, matchId, currentThread.lastMessage.id)
            .catch(err => console.error("[MessageDetail] Failed to mark as read:", err));
        }
      }

      setMessages(msgsResponse.messages);
    } catch (err) {
      console.error("[MessageDetail] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatchAndMessages();

    // Polling simple pour les nouveaux messages
    const interval = setInterval(() => {
      if (token && matchId) {
        getMessages(token, matchId, { limit: 20 })
          .then((res) => {
            setMessages(res.messages);
            
            // Si on reçoit des messages et que le dernier est du partenaire, on le marque comme lu
            const lastMsg = res.messages[res.messages.length - 1];
            if (lastMsg && lastMsg.authorProfileId === partner?.profile.id) {
               markAsRead(token, matchId, lastMsg.id).catch(() => {});
            }
          })
          .catch((err) => console.error("Polling error", err));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMatchAndMessages, token, matchId, partner?.profile.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !token || !matchId || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      const newMessage = await sendMessage(token, matchId, textToSend);
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (err) {
      console.error("[MessageDetail] Failed to send:", err);
      setInputText(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  const partnerProfile = partner?.profile;
  const avatarUri = partnerProfile?.hasAvatar
    ? `${Env.API_URL}/user/profiles/${partnerProfile.id}/avatar`
    : null;

  const keyboardOffset = Platform.OS === "ios" ? 0 : 0; 

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={keyboardOffset}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={router.back}>
            <BackIcon
              width={22}
              height={22}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerCenter}
            onPress={() =>
              partnerProfile?.id && router.push(`/user/${partnerProfile.id}`)
            }
          >
            <Image
              source={
                avatarUri
                  ? {
                      uri: avatarUri,
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  : fallbackAvatar
              }
              style={styles.headerAvatar}
            />
            <View>
              <Text style={styles.headerName}>
                {partnerProfile?.firstName ||
                  partnerProfile?.pseudo ||
                  "Utilisateur"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerMenu} />
        </View>
        <View style={styles.headerDivider} />

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Pas encore de messages.</Text>
              <Text style={styles.emptySubtext}>Commencez à discuter !</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.authorProfileId !== partnerProfile?.id;

            if (item.type === "system") {
              return (
                <View style={styles.systemMessage}>
                  <Text style={styles.systemText}>{item.body}</Text>
                </View>
              );
            }

            return (
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                {!isMe && (
                  <Text style={styles.bubbleName}>
                    {partnerProfile?.firstName || "Partenaire"}
                  </Text>
                )}
                <Text style={isMe ? styles.bubbleText : styles.bubbleTextDark}>
                  {item.body}
                </Text>
                <View style={styles.bubbleFooter}>
                  <Text style={isMe ? styles.timeText : styles.timeTextDark}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {isMe && (
                    <View style={styles.statusContainer}>
                      {item.status === "read" ? (
                        <DoubleTickIcon
                          width={14}
                          height={14}
                          color={Palette.bgWhite}
                        />
                      ) : item.status === "delivered" ? (
                        <DoubleTickIcon
                          width={14}
                          height={14}
                          color="rgba(255,255,255,0.4)"
                        />
                      ) : (
                        <TickIcon
                          width={14}
                          height={14}
                          color="rgba(255,255,255,0.4)"
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View style={styles.inputBarContainer}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Ecrire un message..."
              placeholderTextColor={Palette.grey600}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Palette.bgWhite} />
              ) : (
                <View style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Palette.bgBlack,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.bgBlack,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1D2329",
  },
  headerName: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  headerMenu: {
    width: 28,
    height: 28,
  },
  headerDivider: {
    height: 2,
    backgroundColor: Palette.primary,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 16,
  },
  bubble: {
    borderRadius: 18,
    padding: 14,
    maxWidth: "80%",
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: Palette.primary,
    borderTopRightRadius: 4,
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: Palette.bgWhite,
    borderTopLeftRadius: 4,
  },
  bubbleName: {
    ...Typography.bodyBold,
    color: Palette.black,
    marginBottom: 4,
    fontSize: 12,
  },
  bubbleText: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  bubbleTextDark: {
    ...Typography.bodyMedium,
    color: Palette.black,
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 2,
  },
  timeText: {
    ...Typography.smallLight,
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
  },
  timeTextDark: {
    ...Typography.smallLight,
    color: Palette.grey600,
    fontSize: 10,
  },
  systemMessage: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginVertical: 8,
  },
  systemText: {
    ...Typography.smallLight,
    color: Palette.grey300,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 8,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  emptySubtext: {
    ...Typography.bodyBold,
    color: Palette.primary,
  },
  inputBarContainer: {
    backgroundColor: Palette.bgBlack,
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "android" ? 10 : 0, 
  },
  inputBar: {
    backgroundColor: Palette.bgWhite,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Palette.black,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Palette.grey300,
  },
  sendIcon: {
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Palette.bgWhite,
    transform: [{ rotate: "45deg" }, { translateX: -2 }, { translateY: 2 }],
  },
});
