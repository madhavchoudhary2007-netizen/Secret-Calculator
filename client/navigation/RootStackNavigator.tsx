/**
 * RootStackNavigator.tsx
 * 
 * Configures the app's screen navigation stack.
 * Uses instant transitions to maintain the stealth nature of the secret vault.
 * Headers are hidden throughout to preserve the calculator-only appearance.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalculatorScreen from "@/screens/CalculatorScreen";
import NotesScreen from "@/screens/NotesScreen";
import EditNoteScreen from "@/screens/EditNoteScreen";

// Type definitions for navigation parameters across all screens
export type RootStackParamList = {
  Calculator: undefined;
  Notes: undefined;
  EditNote: { noteId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Calculator"
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen
        name="Calculator"
        component={CalculatorScreen}
      />
      
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
      />
      
      <Stack.Screen
        name="EditNote"
        component={EditNoteScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
