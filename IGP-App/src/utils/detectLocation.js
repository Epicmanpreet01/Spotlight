import * as Location from "expo-location";
import Toast from "react-native-toast-message";

export const detectLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Location permission is needed to your city",
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

    if (geo && geo.length > 0) {
      const place = geo[0];
      const formatted = `${place.name || ""} ${place.street || ""}, ${
        place.city || place.subregion || ""
      }, ${place.region || ""}`.trim();

      return {
        address: formatted,
        city: place.city || place.subregion || "",
        coordinates: [longitude, latitude],
      };
    }

    return null;
  } catch (e) {
    console.log("Location Error:", e);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Unable to detect location. Try again.",
    });
    return null;
  }
};
