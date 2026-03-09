import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Typography } from "@/constants/theme";
import { getAccessToken } from "@/lib/session";
import { listMatches } from "@/lib/matching";
import { getThreads, Thread } from "@/lib/messages";
import { Env } from "@/constants/env";

const fallbackAvatar = require("@/assets/images/landing/landing-3.jpg");

export default function MessagesTabScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const sessionToken = await getAccessToken();
      if (!sessionToken) return;
      setToken(sessionToken);

      const [matchesData, threadsData] = await Promise.all([
        listMatches(sessionToken),
        getThreads(sessionToken),
      ]);

      setMatches(matchesData);
      setThreads(threadsData);
    } catch (err) {
      console.error("[Messages] Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.primary}
          />
        }
      >
        <Text style={styles.title}>Messages</Text>

        {matches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Nouveaux Matchs</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsRow}
            >
              {matches.map((match) => {
                const profile = match.profile;
                const avatarUri = profile.hasAvatar 
                  ? `${Env.API_URL}/user/profiles/${profile.id}/avatar`
                  : null;
                
                return (
                  <TouchableOpacity
                    key={match.id}
                    style={styles.friendItem}
                    onPress={() => router.push(`/message/${match.id}`)}
                    activeOpacity={0.85}
                  >
                    <Image 
                      source={avatarUri ? { uri: avatarUri, headers: { Authorization: `Bearer ${token}` } } : fallbackAvatar} 
                      style={styles.friendAvatar}
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.friendName} numberOfLines={1}>
                      {profile.firstName || profile.pseudo || "Musicos"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.messagesList}>
          {threads.length === 0 ? (
            <Text style={styles.emptyText}>Aucun message pour le moment.</Text>
          ) : (
            threads.map((thread) => {
              const profile = thread.profile;
              const lastMsg = thread.lastMessage;
              const avatarUri = profile.hasAvatar 
                ? `${Env.API_URL}/user/profiles/${profile.id}/avatar`
                : null;

              return (
                <TouchableOpacity
                  key={thread.matchId}
                  style={styles.messageRow}
                  onPress={() => router.push(`/message/${thread.matchId}`)}
                  activeOpacity={0.85}
                >
                  <View>
                    <Image 
                      source={avatarUri ? { uri: avatarUri, headers: { Authorization: `Bearer ${token}` } } : fallbackAvatar} 
                      style={styles.messageAvatar}
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    {thread.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{thread.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.messageBody}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageName}>
                        {profile.firstName || profile.pseudo || "Utilisateur"}
                      </Text>
                      <Text style={styles.messageTime}>
                        {lastMsg ? formatTime(lastMsg.createdAt) : ""}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.messagePreview,
                        thread.unreadCount > 0 && styles.messagePreviewUnread
                      ]} 
                      numberOfLines={1}
                    >
                      {lastMsg ? lastMsg.body : "Commencez à discuter !"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} h`;
  if (days < 7) return `${days} j`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  title: {
    marginTop: 14,
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  sectionTitle: {
    marginTop: 22,
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  friendsRow: {
    marginTop: 16,
    gap: 16,
    paddingRight: 8,
  },
  friendItem: {
    alignItems: "center",
    width: 84,
  },
  friendAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#1D2329",
  },
  friendName: {
    marginTop: 10,
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  messagesList: {
    marginTop: 18,
    gap: 22,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  messageAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1D2329",
  },
  messageBody: {
    flex: 1,
    gap: 6,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageName: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  messageTime: {
    ...Typography.bodyMedium,
    color: Palette.grey600,
  },
  messagePreview: {
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  messagePreviewUnread: {
    color: Palette.bgWhite,
    fontFamily: Typography.bodyBold.fontFamily,
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Palette.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Palette.bgBlack,
  },
  unreadText: {
    color: Palette.bgWhite,
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Palette.grey600,
    textAlign: "center",
    marginTop: 40,
  },
});
