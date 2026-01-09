/**
 * NotesScreen.tsx
 * 
 * The hidden notes vault accessible via the calculator's secret code.
 * Displays all saved notes with options to create, edit, and delete.
 * Users return to the calculator by tapping the grid icon in the header.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { loadNotes, deleteNote, Note } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NotesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refresh notes list whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotesFromStorage();
    }, [])
  );

  const loadNotesFromStorage = async () => {
    setIsLoading(true);
    const savedNotes = await loadNotes();
    setNotes(savedNotes);
    setIsLoading(false);
  };

  // Prompts for confirmation before permanently removing a note
  const handleDeleteNote = useCallback(async (noteId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "Delete Note",
      "Delete this note? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNote(noteId);
            loadNotesFromStorage();
          },
        },
      ]
    );
  }, []);

  const handleEditNote = useCallback((noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("EditNote", { noteId });
  }, [navigation]);

  const handleCreateNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("EditNote", undefined);
  }, [navigation]);

  // Navigates back to the calculator without revealing the vault exists
  const handleReturnToCalculator = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Calculator");
  }, [navigation]);

  // Formats timestamp into a human-readable date string
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Renders an individual note card with edit and delete options
  const renderNoteCard = useCallback(({ item }: { item: Note }) => (
    <Pressable
      testID={`note-card-${item.id}`}
      style={({ pressed }) => [
        styles.noteCard,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => handleEditNote(item.id)}
    >
      <View style={styles.noteContent}>
        <Text 
          style={[styles.noteText, { color: theme.text }]}
          numberOfLines={2}
        >
          {item.content}
        </Text>
        <Text style={[styles.noteTimestamp, { color: theme.textSecondary }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      
      <Pressable
        testID={`delete-note-${item.id}`}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.5 : 1 },
        ]}
        onPress={() => handleDeleteNote(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="trash-2" size={20} color={theme.destructive} />
      </Pressable>
    </Pressable>
  ), [theme, handleEditNote, handleDeleteNote]);

  // Shown when user has no saved notes
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require("../../assets/images/empty-notes.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No secret notes yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Tap + to create your first note
      </Text>
    </View>
  );

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && windowWidth > 600;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[isDesktop && styles.desktopWrapper]}>
        {/* Header with navigation and actions */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          testID="button-back-calculator"
          style={styles.backButton}
          onPress={handleReturnToCalculator}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="grid" size={24} color={theme.textSecondary} />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Notes
        </Text>
        
        <Pressable
          testID="button-create-note"
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleCreateNote}
        >
          <Feather name="plus" size={24} color={theme.primary} />
        </Pressable>
      </View>

      {/* Notes list or empty state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading notes...
          </Text>
        </View>
      ) : notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNoteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl + 70 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

        {/* Floating action button for quick note creation */}
        <Pressable
          testID="fab-create-note"
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.primary,
              bottom: insets.bottom + Spacing.xl,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          onPress={handleCreateNote}
        >
          <Feather name="plus" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  desktopWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    ...Shadows.card,
  },
  noteContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  noteText: {
    fontSize: Typography.body.fontSize,
    marginBottom: Spacing.xs,
  },
  noteTimestamp: {
    fontSize: Typography.small.fontSize,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.fab,
  },
});
