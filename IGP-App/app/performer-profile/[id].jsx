import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { usePerformerByIdQuery } from "../../src/hooks/queries/usePerformers";
import { useCreateBookingMutation } from "../../src/hooks/mutations/useBookingMutations";
import { useMyGigsQuery } from "../../src/hooks/queries/useGigs";
import { useCurrentUser } from "../../src/hooks/queries/useAuth";

import { IMAGES } from "../../src/constants/images.js";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 360;

export default function PerformerProfileView() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  /* ===================== POPUP STATES ===================== */
  const [showHirePopup, setShowHirePopup] = useState(false);
  const [hireStep, setHireStep] = useState("choice");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  /* ===================== DATA ===================== */
  const { data, isLoading } = usePerformerByIdQuery(id);
  const { data: meResp } = useCurrentUser();

  const isBooker = meResp?.data?.role === "booker";
  const { data: myGigs = [] } = useMyGigsQuery(isBooker);

  const { mutate: createBooking } = useCreateBookingMutation();

  if (isLoading || !data?.data) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading…</Text>
      </View>
    );
  }

  const perf = data.data;

  /* ===================== GALLERY ===================== */
  const gallery =
    perf.galleryImages?.length > 0
      ? perf.galleryImages
      : [perf.user?.profileImage];

  const goLeft = () => {
    if (index > 0) {
      const next = index - 1;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  const goRight = () => {
    if (index < gallery.length - 1) {
      const next = index + 1;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  /* ===================== HIRE ACTION ===================== */
  const hirePerformerForEvent = (gig) => {
    if (!gig) return;

    createBooking({
      performerId: perf.user._id,
      gigId: gig._id,
      eventDate: gig.eventDate,
      totalPrice: gig.budget,
      source: "direct",
    });

    setShowHirePopup(false);
    setHireStep("choice");
    setShowConfirmPopup(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ================= GALLERY ================= */}
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
        >
          {gallery.map((img, i) => {
            const source =
              typeof img === "string" && img.length > 0
                ? { uri: img }
                : IMAGES.NO_IMAGE;

            return <Image key={i} source={source} style={styles.banner} />;
          })}
        </ScrollView>

        <SafeAreaView style={styles.backWrap}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        {index > 0 && (
          <TouchableOpacity
            style={[styles.arrow, styles.left]}
            onPress={goLeft}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        {index < gallery.length - 1 && (
          <TouchableOpacity
            style={[styles.arrow, styles.right]}
            onPress={goRight}
          >
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {perf.user?.name}
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="mic-outline"
            size={18}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.rowText, { color: theme.colors.textSecondary }]}>
            {perf.category}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons
            name="location-outline"
            size={18}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.rowText, { color: theme.colors.textSecondary }]}>
            {perf.user?.city || "Location not set"}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={20} color="#FFC107" />
          <Text style={[styles.ratingText, { color: theme.colors.text }]}>
            {perf.averageRating} ({perf.reviewCount} reviews)
          </Text>
        </View>

        <Text style={[styles.section, { color: theme.colors.text }]}>
          Description
        </Text>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
          {perf.bio || "No description added."}
        </Text>

        <Text style={[styles.section, { color: theme.colors.text }]}>
          Past Events
        </Text>

        {perf.bookings?.length > 0 ? (
          perf.bookings.map((b) => (
            <Text
              key={b._id}
              style={[styles.past, { color: theme.colors.textSecondary }]}
            >
              • {b.gig?.title} – {b.gig?.location?.address}
            </Text>
          ))
        ) : (
          <Text style={[styles.past, { color: theme.colors.textSecondary }]}>
            No past events yet.
          </Text>
        )}
      </ScrollView>

      {/* ================= FOOTER ================= */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.price, { color: "#00C853" }]}>
          Starting ₹{perf.priceStartingAt}
        </Text>

        <TouchableOpacity
          style={[styles.hireBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setHireStep("choice");
            setShowHirePopup(true);
          }}
        >
          <Text style={styles.hireText}>Hire</Text>
        </TouchableOpacity>
      </View>

      {/* ================= HIRE POPUP ================= */}
      <Modal visible={showHirePopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View
            style={[styles.popupCard, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={theme.colors.primary}
            />
            <Text style={[styles.popupTitle, { color: theme.colors.text }]}>
              Hire this performer
            </Text>

            {hireStep === "choice" && (
              <>
                <Text
                  style={[
                    styles.popupSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Do you already have an event, or would you like to create one?
                </Text>

                <TouchableOpacity
                  style={[
                    styles.actionBtnFilled,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setHireStep("selectEvent")}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.actionBtnFilledText}>
                    I already have an event
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtnOutline,
                    { borderColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    setShowHirePopup(false);
                    router.push("/booker/create-event");
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.actionBtnOutlineText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Create event first
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {hireStep === "selectEvent" && (
              <>
                <Text
                  style={[
                    styles.popupSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Select one of your events:
                </Text>

                <View style={styles.dropdownBox}>
                  {myGigs.length === 0 ? (
                    <Text style={{ color: theme.colors.textSecondary }}>
                      No events created.
                    </Text>
                  ) : (
                    myGigs.map((gig) => (
                      <TouchableOpacity
                        key={gig._id}
                        style={styles.dropdownItem}
                        onPress={() => hirePerformerForEvent(gig)}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "700",
                          }}
                        >
                          {gig.title}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary }}>
                          {gig.location?.address}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                setShowHirePopup(false);
                setHireStep("choice");
              }}
              style={styles.cancelBtn}
            >
              <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= CONFIRM POPUP ================= */}
      <Modal visible={showConfirmPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View
            style={[styles.popupCard, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
            <Text style={[styles.popupTitle, { color: theme.colors.text }]}>
              Performer hired successfully!
            </Text>
            <TouchableOpacity
              style={[
                styles.popupPrimaryBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setShowConfirmPopup(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { width, height: IMAGE_HEIGHT, resizeMode: "cover" },
  backWrap: { position: "absolute", top: 15, left: 15 },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 10,
    borderRadius: 22,
  },
  arrow: {
    position: "absolute",
    top: IMAGE_HEIGHT / 2 - 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  left: { left: 10 },
  right: { right: 10 },
  content: {
    padding: 20,
    paddingBottom: 120,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  name: { fontSize: 28, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 },
  rowText: { fontSize: 15 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  ratingText: { fontWeight: "700", fontSize: 15 },
  section: { marginTop: 28, fontSize: 20, fontWeight: "700" },
  desc: { marginTop: 10, lineHeight: 22, fontSize: 15 },
  past: { marginTop: 10, lineHeight: 20, fontSize: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    alignItems: "center",
    borderTopWidth: 1,
  },
  price: { fontSize: 20, fontWeight: "900" },
  hireBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16 },
  hireText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupCard: {
    width: "85%",
    padding: 25,
    borderRadius: 18,
    alignItems: "center",
  },
  popupTitle: { fontSize: 20, fontWeight: "700", marginTop: 12 },
  popupSubtitle: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  actionBtnFilled: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionBtnFilledText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtnOutline: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionBtnOutlineText: { fontWeight: "700", fontSize: 15 },
  dropdownBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    borderColor: "#555",
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  cancelBtn: { marginTop: 20, padding: 10 },
  popupPrimaryBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  popupBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
