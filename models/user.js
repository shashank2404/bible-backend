const mongoose = require("mongoose");

const verseBookmarkSchema = new mongoose.Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  verseText: { type: String, default: "" },
  addedAt: { type: Date, default: Date.now },
}, { _id: true });

const chapterBookmarkSchema = new mongoose.Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: true });

const noteSchema = new mongoose.Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  verseText: { type: String, default: "" },
  noteText: { type: String, required: true },
  hlColorId: { type: String, default: "gold" },
  textStyleId: { type: String, default: "normal" },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

// ─── NEW: Calendar Entry Schema ───────────────────────────────
const calendarEntrySchema = new mongoose.Schema({
  dateKey: { type: String, required: true }, // e.g. "2026-04-12"
  time: { type: Number, default: 0 },     // minutes spent
  verses: { type: Number, default: 0 },     // verses read
  acts: { type: [String], default: [] },  // ["Reading", "Prayer", ...]
  notes: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true },

  // ─── Auth ─────────────────────────────────────────────────
  // password is optional — Google OAuth users won't have one
  password:      { type: String, default: null },
  authProvider:  { type: String, default: 'local' }, // 'local' | 'google' | 'facebook'
  facebookId:    { type: String, default: null },
  picture:       { type: String, default: '' },

  // ─── Password Reset ────────────────────────────────────────
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date,   default: null },

  // ─── Activity ─────────────────────────────────────────────
  streak:        { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStreakDate:{ type: String, default: null },

  onboarding: {
    denomination:  { type: String,   default: '' },
    bibleVersion:  { type: String,   default: '' },
    ageGroup:      { type: String,   default: '' },
    gender:        { type: String,   default: '' },
    churchName:    { type: String,   default: '' },
    notifications: { type: [String], default: [] },
    completed:     { type: Boolean,  default: false },
  },

  verseBookmarks:   { type: [verseBookmarkSchema],   default: [] },
  chapterBookmarks: { type: [chapterBookmarkSchema], default: [] },
  notes:            { type: [noteSchema],            default: [] },
  calendarEntries:  { type: [calendarEntrySchema],   default: [] },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);