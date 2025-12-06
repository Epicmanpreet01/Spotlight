export function sanitizeVideoLink(url) {
  if (!url || typeof url !== "string") return null;

  // Normalize
  url = url.trim();

  // Youtube (Watch, Shorts, youtu.be, embed)
  if (url.includes("youtu")) {
    let id = null;

    // 1. Shorts → youtube.com/shorts/VIDEO_ID
    if (url.includes("/shorts/")) {
      id = url.split("/shorts/")[1]?.split("?")[0];
    }

    // 2. Normal YouTube watch → watch?v=VIDEO_ID
    else if (url.includes("watch?v=")) {
      id = url.split("v=")[1]?.split("&")[0];
    }

    // 3. youtu.be/VIDEO_ID
    else if (url.includes("youtu.be")) {
      id = url.split("youtu.be/")[1]?.split("?")[0];
    }

    // 4. embed/VIDEO_ID
    else if (url.includes("/embed/")) {
      id = url.split("/embed/")[1]?.split("?")[0];
    }

    // 5. Fallback — last path segment
    else {
      id = url.split("/").pop().split("?")[0];
    }

    if (!id) return null;

    return `https://www.youtube.com/embed/${id}`;
  }

  // Vimeo
  if (url.includes("vimeo")) {
    const id = url.split("/").pop();
    return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}

export const validateLocation = (loc) => {
  if (typeof loc !== "object" || loc === null || Array.isArray(loc)) {
    throw new Error("Location must be an object");
  }

  const type = loc.type || "Point";
  const coords = loc.coordinates;

  if (type !== "Point") {
    throw new Error("Location.type must be 'Point'");
  }

  if (!Array.isArray(coords) || coords.length !== 2) {
    throw new Error("Location.coordinates must be [longitude, latitude]");
  }

  const [lng, lat] = coords;

  if (typeof lng !== "number" || typeof lat !== "number") {
    throw new Error("Coordinates must be numbers");
  }

  if (lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  if (lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  return { lng, lat };
};

export const validateDateRange = (dateObj = {}) => {
  if (
    typeof dateObj !== "object" ||
    Array.isArray(dateObj) ||
    dateObj === null
  ) {
    throw new Error("eventDate must be an object containing 'start' or 'end'");
  }

  const { start, end } = dateObj;

  let startDate = null;
  let endDate = null;

  // Validate start
  if (start !== undefined) {
    startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid date format for eventDate.start");
    }
  }

  // Validate end
  if (end !== undefined) {
    endDate = new Date(end);
    if (isNaN(endDate.getTime())) {
      throw new Error("Invalid date format for eventDate.end");
    }
  }

  // Validate range order
  if (startDate && endDate && startDate > endDate) {
    throw new Error("eventDate.start cannot be later than eventDate.end");
  }

  // If one is missing → invalid
  if (startDate === null || endDate === null) {
    throw new Error("eventDate must contain 'start' and 'end'");
  }

  return {
    start: startDate || undefined,
    end: endDate || undefined,
  };
};
