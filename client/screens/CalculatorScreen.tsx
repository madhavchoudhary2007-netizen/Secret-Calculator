/**
 * CalculatorScreen.tsx
 * 
 * The main calculator interface that serves as the app's primary view.
 * Provides full arithmetic functionality while concealing a secret notes
 * vault accessible via a specific input sequence (69/67=).
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { loadHistory, saveHistory, HistoryItem } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// The exact sequence that triggers navigation to the hidden notes vault
const SECRET_CODE = "69/67";

// Button configuration for the calculator grid layout
const BUTTON_LAYOUT = [
  { value: "C", type: "function" },
  { value: "DEL", type: "function" },
  { value: "/", type: "operator" },
  { value: "*", type: "operator" },
  { value: "7", type: "number" },
  { value: "8", type: "number" },
  { value: "9", type: "number" },
  { value: "-", type: "operator" },
  { value: "4", type: "number" },
  { value: "5", type: "number" },
  { value: "6", type: "number" },
  { value: "+", type: "operator" },
  { value: "1", type: "number" },
  { value: "2", type: "number" },
  { value: "3", type: "number" },
  { value: "=", type: "equals" },
  { value: "0", type: "number" },
  { value: ".", type: "number" },
];

export default function CalculatorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // Current expression being built by user input
  const [expression, setExpression] = useState<string>("0");
  
  // The computed result after pressing equals
  const [result, setResult] = useState<string>("");
  
  // Persisted calculation history (max 10 entries)
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Tracks whether the last action was a calculation, affecting next input behavior
  const [justCalculated, setJustCalculated] = useState<boolean>(false);

  // Load persisted history when the screen mounts
  useEffect(() => {
    loadHistory().then((savedHistory) => {
      if (savedHistory) {
        setHistory(savedHistory);
      }
    });
  }, []);

  // Determines if the current expression matches the secret access code
  const checkSecretCode = useCallback((expr: string): boolean => {
    return expr === SECRET_CODE;
  }, []);

  /**
   * Evaluates a mathematical expression string with proper operator precedence.
   * Handles basic arithmetic operations and returns the computed result.
   * Returns "Error" for invalid expressions or division by zero.
   */
  const evaluateExpression = useCallback((expr: string): string => {
    try {
      // Normalize operator symbols for evaluation
      let cleanExpr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
      
      // Security check: only allow valid mathematical characters
      if (!/^[\d+\-*/.\s()]+$/.test(cleanExpr)) {
        return "Error";
      }
      
      // Evaluate using Function constructor (safer than eval)
      const result = new Function(`return ${cleanExpr}`)();
      
      // Handle infinity and NaN cases
      if (!isFinite(result)) {
        return "Error";
      }
      
      // Round to avoid floating-point precision artifacts
      const rounded = Math.round(result * 1000000000) / 1000000000;
      return String(rounded);
    } catch {
      return "Error";
    }
  }, []);

  /**
   * Processes button presses and updates calculator state accordingly.
   * Handles digits, operators, clear, delete, equals, and secret code detection.
   */
  const handleButtonPress = useCallback(async (value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear: reset calculator and wipe history
    if (value === "C") {
      setExpression("0");
      setResult("");
      setJustCalculated(false);
      setHistory([]);
      await saveHistory([]);
      return;
    }

    // Delete: remove the last character from expression
    if (value === "DEL") {
      setExpression((prev) => {
        if (prev.length <= 1) return "0";
        return prev.slice(0, -1);
      });
      setJustCalculated(false);
      return;
    }

    // Equals: either trigger secret navigation or compute result
    if (value === "=") {
      if (checkSecretCode(expression)) {
        // Secret code detected - navigate without leaving a trace
        setExpression("0");
        setResult("");
        navigation.navigate("Notes");
        return;
      }

      const calcResult = evaluateExpression(expression);
      
      if (calcResult !== "Error") {
        // Add successful calculation to history
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          expression: expression,
          result: calcResult,
          timestamp: Date.now(),
        };
        
        const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
        setHistory(updatedHistory);
        await saveHistory(updatedHistory);
      }
      
      setResult(calcResult);
      setJustCalculated(true);
      return;
    }

    // Handle digit and operator input
    setExpression((prev) => {
      // After calculation, start fresh with a new number
      if (justCalculated && /\d/.test(value)) {
        setJustCalculated(false);
        return value;
      }
      
      // After calculation, continue from result with an operator
      if (justCalculated && /[+\-*/]/.test(value)) {
        setJustCalculated(false);
        return result + value;
      }
      
      setJustCalculated(false);
      
      // Replace initial zero with first digit
      if (prev === "0" && /\d/.test(value)) {
        return value;
      }
      
      // Prevent consecutive operators
      if (/[+\-*/]$/.test(prev) && /[+\-*/]/.test(value)) {
        return prev.slice(0, -1) + value;
      }
      
      // Prevent multiple decimals in a single number
      if (value === ".") {
        const parts = prev.split(/[+\-*/]/);
        const lastNumber = parts[parts.length - 1];
        if (lastNumber.includes(".")) {
          return prev;
        }
      }
      
      return prev + value;
    });
  }, [expression, result, history, justCalculated, checkSecretCode, evaluateExpression, navigation]);

  // Returns appropriate styling based on button type
  const getButtonStyle = useCallback((type: string) => {
    switch (type) {
      case "number":
        return { backgroundColor: theme.numberButton, textColor: theme.text };
      case "operator":
        return { backgroundColor: theme.operatorButton, textColor: "#FFFFFF" };
      case "equals":
        return { backgroundColor: theme.equalsButton, textColor: "#FFFFFF" };
      case "function":
        return { backgroundColor: theme.functionButton, textColor: "#FFFFFF" };
      default:
        return { backgroundColor: theme.numberButton, textColor: theme.text };
    }
  }, [theme]);

  // Renders a single history entry
  const renderHistoryItem = useCallback(({ item }: { item: HistoryItem }) => (
    <Text style={[styles.historyItem, { color: theme.textSecondary }]}>
      {item.expression} = {item.result}
    </Text>
  ), [theme.textSecondary]);

  // Calculate responsive button dimensions with max width for desktop
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && windowWidth > 500;
  const maxCalcWidth = isDesktop ? 400 : windowWidth;
  const buttonSize = (maxCalcWidth - Spacing.lg * 2 - Spacing.sm * 3) / 4;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[
        styles.calculatorWrapper,
        isDesktop && styles.desktopWrapper,
        { paddingTop: insets.top + Spacing.lg }
      ]}>
        
        {/* Calculation history display */}
        <View style={styles.historyContainer}>
          {history.length > 0 ? (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />
          ) : (
            <Text style={[styles.historyPlaceholder, { color: theme.textSecondary }]}>
              No history yet
            </Text>
          )}
        </View>

        {/* Main display showing current expression and result */}
        <View style={[styles.displayContainer, { backgroundColor: theme.backgroundDefault }]}>
          <Text 
            style={[styles.expression, { color: theme.textSecondary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {expression}
          </Text>
          <Text 
            style={[styles.result, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {result || " "}
          </Text>
        </View>

        {/* Calculator button grid */}
        <View style={styles.buttonsContainer}>
          {BUTTON_LAYOUT.map((button, index) => {
            const buttonStyle = getButtonStyle(button.type);
            const isZero = button.value === "0";
            const isEquals = button.value === "=" && index === 15;
            
            return (
              <Pressable
                key={`${button.value}-${index}`}
                testID={`button-${button.value}`}
                style={({ pressed }) => [
                  styles.button,
                  {
                    width: isZero ? buttonSize * 2 + Spacing.sm : buttonSize,
                    height: isEquals ? buttonSize * 2 + Spacing.sm : buttonSize,
                    backgroundColor: buttonStyle.backgroundColor,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
                onPress={() => handleButtonPress(button.value)}
              >
                <Text style={[styles.buttonText, { color: buttonStyle.textColor }]}>
                  {button.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      
      <View style={{ height: insets.bottom + Spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  calculatorWrapper: {
    width: "100%",
  },
  desktopWrapper: {
    maxWidth: 400,
    alignSelf: "center",
  },
  historyContainer: {
    height: 120,
    paddingHorizontal: Spacing.lg,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    fontSize: Typography.small.fontSize,
    textAlign: "right",
    paddingVertical: Spacing.xs,
  },
  historyPlaceholder: {
    fontSize: Typography.small.fontSize,
    textAlign: "center",
    paddingTop: Spacing.xl,
  },
  displayContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  expression: {
    fontSize: 20,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  result: {
    fontSize: Typography.display.fontSize,
    fontWeight: Typography.display.fontWeight,
    textAlign: "right",
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.lg,
    gap: Spacing.sm,
    justifyContent: "flex-start",
  },
  button: {
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: "500",
  },
});
