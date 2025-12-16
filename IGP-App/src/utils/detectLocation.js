// src/utils/detectLocation.js
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export const detectLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Location permission is needed to detect your city",
      });
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = loc.coords;

    const geo = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!geo?.length) return null;

    const place = geo[0];

    return {
      address: `${place.name || ""} ${place.street || ""}`.trim(),
      city: place.city || place.subregion || "",
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };
  } catch (e) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Unable to detect location. Try again.",
    });
    return null;
  }
};
