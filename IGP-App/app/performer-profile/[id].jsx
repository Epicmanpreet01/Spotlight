import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import * as VideoThumbnails from "expo-video-thumbnails";

/* ===================== HOOKS ===================== */
import { usePerformerByIdQuery } from "../../src/hooks/queries/usePerformers";
import { useCreateBookingMutation } from "../../src/hooks/mutations/useBookingMutations";
import { useMyGigsQuery } from "../../src/hooks/queries/useGigs";
import { useCurrentUser } from "../../src/hooks/queries/useAuth";

/* ===================== COMPONENTS ===================== */
import ImageViewerModal from "../../src/components/profile/ImageViewerModal";
import { IMAGES } from "../../src/constants/images";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 360;
const isVideo = (uri = "") => uri.endsWith(".mp4") || uri.includes("video");

export default function PerformerProfileView() {
  const {
    id,
    source = "direct",
    gigId,
    eventDate: rawEventDate,
    budget,
  } = useLocalSearchParams();

  const parsedEventDate = rawEventDate ? JSON.parse(rawEventDate) : null;
  const isApplicantSource = source === "applicant";

  const router = useRouter();
  const { theme } = useTheme();

  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [previewUri, setPreviewUri] = useState(null);
  const [videoThumbs, setVideoThumbs] = useState({});
  const [showHirePopup, setShowHirePopup] = useState(false);
  const [hireStep, setHireStep] = useState("choice");

  const { data, isLoading } = usePerformerByIdQuery(id);
  const { data: meResp } = useCurrentUser();
  const isBooker = meResp?.data?.role === "booker";
  const { data: myGigs = [] } = useMyGigsQuery(isBooker);
  const { mutate: createBooking } = useCreateBookingMutation();

  const perf = data?.data;

  const gallery =
    perf?.galleryImages?.length > 0
      ? perf.galleryImages
      : [perf?.user?.profileImage];

  /* ===================== VIDEO THUMBS ===================== */
  useEffect(() => {
    let cancelled = false;
    const generateThumbs = async () => {
      const map = {};
      for (const uri of gallery) {
        if (uri && isVideo(uri) && !videoThumbs[uri]) {
          try {
            const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(
              uri,
              {
                time: 1000,
              }
            );
            if (!cancelled) map[uri] = thumb;
          } catch {}
        }
      }
      if (!cancelled && Object.keys(map).length) {
        setVideoThumbs((prev) => ({ ...prev, ...map }));
      }
    };
    generateThumbs();
    return () => {
      cancelled = true;
    };
  }, [gallery]);

  if (isLoading || !perf) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading…</Text>
      </View>
    );
  }

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
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ================= GALLERY ================= */}
      <View
        style={{
          overflow: "hidden",
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {gallery.map((media, i) => {
            const uri = typeof media === "string" ? media : null;
            const thumb = uri && isVideo(uri) ? videoThumbs[uri] : uri;

            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                onPress={() => uri && setPreviewUri(uri)}
              >
                <Image
                  source={thumb ? { uri: thumb } : IMAGES.NO_IMAGE}
                  style={styles.banner}
                />
                {uri && isVideo(uri) && (
                  <View style={styles.playOverlay}>
                    <Ionicons
                      name="play-circle"
                      size={72}
                      color="rgba(255,255,255,0.95)"
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
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
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        style={{ marginTop: -32 }}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {perf.user?.name}
        </Text>

        <View style={[styles.badge, { backgroundColor: theme.colors.inputBg }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
            {perf.category}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {perf.user?.city || "Location not set"}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.infoRow}>
            <Ionicons name="star" size={18} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {perf.averageRating} ({perf.reviewCount} reviews)
            </Text>
          </View>
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
              • {b.gig?.title}
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
        <Text
          style={[
            styles.price,
            { color: theme.colors.success || theme.colors.primary },
          ]}
        >
          Starting ₹{perf.priceStartingAt}
        </Text>

        <TouchableOpacity
          style={[styles.hireBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            if (isApplicantSource && gigId && parsedEventDate) {
              Alert.alert(
                "Confirm Hire",
                "Are you sure you want to hire this performer for this event?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes, Hire",
                    style: "destructive",
                    onPress: () =>
                      createBooking({
                        performerId: perf.user._id,
                        gigId,
                        eventDate: parsedEventDate,
                        totalPrice: Number(budget) || perf.priceStartingAt,
                        source: "applicant",
                      }),
                  },
                ]
              );
            } else {
              setHireStep("choice");
              setShowHirePopup(true);
            }
          }}
        >
          <Text style={styles.hireText}>Hire</Text>
        </TouchableOpacity>
      </View>

      <ImageViewerModal
        visible={!!previewUri}
        uri={previewUri}
        onClose={() => setPreviewUri(null)}
      />

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
              <View
                style={[
                  styles.dropdownBox,
                  { borderColor: theme.colors.border },
                ]}
              >
                {myGigs.length === 0 ? (
                  <Text style={{ color: theme.colors.textSecondary }}>
                    No events created yet.
                  </Text>
                ) : (
                  myGigs.map((gig) => (
                    <TouchableOpacity
                      key={gig._id}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: theme.colors.border },
                      ]}
                      onPress={() => hirePerformerForEvent(gig)}
                    >
                      <Text
                        style={{ fontWeight: "700", color: theme.colors.text }}
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
    </View>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { width, height: IMAGE_HEIGHT, resizeMode: "cover" },
  playOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  backWrap: { position: "absolute", top: 15, left: 15 },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 10,
    borderRadius: 22,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  name: { fontSize: 28, fontWeight: "800" },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  badgeText: { fontWeight: "700" },
  infoCard: {
    marginTop: 18,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginVertical: 10 },
  section: { marginTop: 26, fontSize: 20, fontWeight: "700" },
  desc: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  past: { marginTop: 6, fontSize: 14 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  actionBtnFilled: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  actionBtnFilledText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtnOutline: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 2,
    alignItems: "center",
  },
  actionBtnOutlineText: { fontWeight: "700", fontSize: 15 },
  dropdownBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cancelBtn: { marginTop: 20, padding: 10 },
});
