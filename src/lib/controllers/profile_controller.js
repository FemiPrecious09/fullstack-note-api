import { getUserProfileDB, upsertUserProfileDB } from "../models/profile_model";

const REQUIRED_FIELDS = [
  "occupation",
  "industry",
  "hobbies",
  "current_learning",
  "learning_style",
  "goal",
  "language_preference",
];

export const getUserProfile = async (user) => {
  const profile = await getUserProfileDB(user.public_id);
  if (!profile) {
    const err = new Error("Profile not found");
    err.status = 404;
    throw err;
  }
  return profile;
};

export const saveUserProfile = async (user, body) => {
  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length > 0) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const profile = await upsertUserProfileDB(user.public_id, body);
  return profile;
};