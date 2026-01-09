/**
 * EditNoteScreen.tsx
 * 
 * A modal screen for creating new notes or editing existing ones.
 * Handles text input, validation, save/cancel actions, and deletion.
 * Includes unsaved changes detection to prevent accidental data loss.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { addNote, updateNote, getNoteById, deleteNote, Note } from "@/lib/storage";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "EditNote">;

export default function EditNoteScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  // Determine if we're editing an existing note or creating a new one
  const noteId = route.params?.noteId;
  const isEditMode = Boolean(noteId);

  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [originalNote, setOriginalNote] = useState<Note | null>(null);

  // Fetch existing note data when editing
  useEffect(() => {
    if (isEditMode && noteId) {
      loadNote();
    }
  }, [noteId, isEditMode]);

  const loadNote = async () => {
    if (!noteId) return;
    
    setIsLoading(true);
    const note = await getNoteById(noteId);
    
    if (note) {
      setContent(note.content);
      setOriginalNote(note);
    }
    
    setIsLoading(false);
  };

  // Validates input and persists the note to storage
  const handleSave = useCallback(async () => {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      Alert.alert("Empty Note", "Please enter some text before saving.");
      return;
    }

    setIsSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      if (isEditMode && noteId) {
        await updateNote(noteId, trimmedContent);
      } else {
        await addNote(trimmedContent);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [content, isEditMode, noteId, navigation]);

  // Prompts user before discarding unsaved changes
  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const hasChanges = isEditMode
      ? content !== originalNote?.content
      : content.trim().length > 0;

    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [content, isEditMode, originalNote, navigation]);

  // Confirms and removes the note permanently
  const handleDelete = useCallback(async () => {
    if (!noteId) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "Delete Note",
      "Delete this note? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNote(noteId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [noteId, navigation]);

  // Loading state while fetching existing note
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <Pressable style={styles.headerButton} onPress={handleCancel}>
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Loading...
          </Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && windowWidth > 600;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[isDesktop && styles.desktopWrapper]}>
        {/* Header with cancel, title, and save actions */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          testID="button-cancel"
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditMode ? "Edit Note" : "New Note"}
        </Text>

        <Pressable
          testID="button-save"
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed || isSaving ? 0.7 : 1 },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={[styles.saveText, { color: theme.primary }]}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      {/* Note content input area */}
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          testID="input-note-content"
          style={[
            styles.textInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.backgroundSecondary,
            },
          ]}
          placeholder="Type your secret note..."
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        {/* Delete option shown only when editing */}
        {isEditMode ? (
          <Pressable
            testID="button-delete-note"
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color={theme.destructive} />
            <Text style={[styles.deleteText, { color: theme.destructive }]}>
              Delete Note
            </Text>
          </Pressable>
        ) : null}
      </KeyboardAwareScrollViewCompat>
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
  headerButton: {
    minWidth: 60,
    height: 44,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
  },
  cancelText: {
    fontSize: Typography.body.fontSize,
  },
  saveText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  textInput: {
    minHeight: 200,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: Typography.body.fontSize,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  deleteText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
