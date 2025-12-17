import { PERFORMER_CATEGORIES } from "./performerProfile.model.js";

const PASSWORD_REGEX = /^(?=.*[A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validSignupSchema = {
  name: {
    type: "string",
    maxLength: 50,
    required: true,
  },
  email: {
    type: "string",
    regex: EMAIL_REGEX,
    required: true,
  },
  password: {
    type: "string",
    regex: PASSWORD_REGEX,
    required: true,
  },
  role: {
    type: "string",
    enum: ["performer", "booker"],
    required: true,
  },
  category: {
    type: "string",
    enum: PERFORMER_CATEGORIES,
  },
  priceStartingAt: {
    type: "number",
    min: 1,
  },
  type: {
    type: "string",
  },
};

export const validLoginSchema = {
  email: {
    type: "string",
    regex: EMAIL_REGEX,
  },
  password: {
    type: "string",
    regex: PASSWORD_REGEX,
  },
};

export const validUserUpdatesSchema = {
  name: {
    type: "string",
    minLength: 2,
    maxLength: 50,
  },
  currentPassword: {
    type: "string",
    regex: PASSWORD_REGEX,
  },
  newPassword: {
    type: "string",
    regex: PASSWORD_REGEX,
  },
  city: {
    type: "string",
  },
  location: {
    type: "object",
  },
};

export const validPerformerUpdatesSchema = {
  category: {
    type: "string",
    enum: PERFORMER_CATEGORIES,
  },
  subCategory: {
    type: "array",
  },
  type: {
    type: "string",
    enum: ["solo", "group"],
  },
  bio: {
    type: "string",
    maxLength: 500,
  },

  priceStartingAt: {
    type: "number",
    min: 0,
  },
  videoLinks: {
    type: "array",
    regex:
      /^(https?:\/\/)?(www\.)?((youtube\.com\/(watch\?v=|shorts\/))|youtu\.be\/|vimeo\.com\/\d+).*$/i,
  },
};

export const validFilterSchema = {
  category: {
    type: "string",
    enum: PERFORMER_CATEGORIES,
  },
  type: {
    type: "string",
    enum: ["solo", "group"],
  },
  averageRating: {
    type: "number",
    min: 0,
    max: 5,
  },
  priceStartingAt: {
    type: "number",
    min: 0,
  },
  radius: {
    type: "number",
    min: 1,
  },
  page: {
    type: "number",
  },
  limit: {
    type: "number",
  },
  name: { type: "string", isRegex: true },
};

export const validGigFilterSchema = {
  title: {
    type: "string",
    maxLength: 40,
    isRegex: true,
  },
  budget: {
    type: "number",
    min: 1,
  },
  category: {
    type: "string",
    enum: PERFORMER_CATEGORIES,
  },
  eventDate: {
    type: "object",
  },
  radius: {
    // 👈 add this
    type: "number",
    min: 1,
  },
  page: { type: "number" },
  limit: { type: "number" },
};

export const validGigSchema = {
  title: {
    type: "string",
    maxLength: 50,
  },
  description: {
    type: "string",
  },
  eventDate: {
    type: "object", // { start: , end:  }
  },
  location: {
    type: "object", // { type: , coordinates: , address:  }
  },
  budget: {
    type: "number",
    min: 1,
  },
  categoryRequired: {
    type: "string",
    enum: PERFORMER_CATEGORIES,
  },
};

export const validApplySchema = {
  coverMessage: {
    type: "string",
    maxLength: 500,
  },
};

export const validCloseGigSchema = {
  reason: {
    type: "string",
    maxLength: 300,
  },
};

export const validReviewSchema = {
  rating: {
    type: "number",
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: "string",
    maxLength: 500,
  },
};

export const validBookingCreateSchema = {
  performerId: { type: "string", required: true },

  gigId: { type: "string", required: true },

  eventDate: { type: "object", required: true },

  totalPrice: { type: "number", min: 1 },

  source: {
    type: "string",
    enum: ["direct", "applicant"],
    required: false,
  },
};
