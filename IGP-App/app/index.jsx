import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Colors from "../src/constants/Colors";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animation: Fade in + scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // After 2.5 sec, decide where to go
    const timer = setTimeout(async () => {
      const token = await SecureStore.getItemAsync("igp_token");

      if (token) {
        // User already authenticated
        router.replace("/(tabs)/home");
      } else {
        // No token → go to sign-in
        router.replace("/(auth)/sign-in");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splashBackground,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 999,
  },
  circleTop: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.6,
    left: -width * 0.1,
  },
  circleBottom: {
    width: width,
    height: width,
    bottom: -width * 0.3,
    right: -width * 0.3,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    width: "100%",
  },
  logoImage: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  version: {
    color: "rgba(255, 255, 255, 0.2)",
    fontSize: 12,
  },
});
