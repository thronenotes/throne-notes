import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── ENUMS ─────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["creator", "follower", "admin"]);
export const tierEnum = pgEnum("tier", ["free", "pro"]);
export const bookStatusEnum = pgEnum("book_status", ["draft", "editing", "published", "archived"]);
export const chapterStatusEnum = pgEnum("chapter_status", ["draft", "editing", "published"]);
export const entryTypeEnum = pgEnum("entry_type", ["dream", "revelation", "battle", "decree", "teaching"]);
export const spiritualStateEnum = pgEnum("spiritual_state", ["aligned", "drained", "anointed", "warring", "resting", "interceding"]);

// ─── PROFILES ──────────────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: roleEnum("role").default("follower"),
  subscriptionTier: tierEnum("subscription_tier").default("free"),
  birthDate: date("birth_date"),
  lifePath: integer("life_path"),
  expressionNum: integer("expression_num"),
  soulUrgeNum: integer("soul_urge_num"),

  // ─── EMAIL AUTH FIELDS ───────────────────────────────────────
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires", { withTimezone: true }),
  // ─────────────────────────────────────────────────────────────

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── BOOKS ─────────────────────────────────────────────────────────

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  status: bookStatusEnum("status").default("draft"),
  priceDigital: decimal("price_digital", { precision: 10, scale: 2 }),
  slug: text("slug").unique(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── CHAPTERS ──────────────────────────────────────────────────────

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").references(() => books.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  orderIndex: integer("order_index").notNull(),
  status: chapterStatusEnum("status").default("draft"),
  sourceDreamId: uuid("source_dream_id"),
  wordCount: integer("word_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── JOURNAL ENTRIES ───────────────────────────────────────────────

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  entryType: entryTypeEnum("entry_type").default("dream"),
  tags: text("tags").array().default([]),
  spiritualState: spiritualStateEnum("spiritual_state"),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  isTranscribed: boolean("is_transcribed").default(false),
  dateOccurred: date("date_occurred").defaultNow(),
  mood: text("mood"),
  location: text("location"),
  personalYear: integer("personal_year"),
  personalMonth: integer("personal_month"),
  personalDay: integer("personal_day"),
  isPrivate: boolean("is_private").default(true),
  isShared: boolean("is_shared").default(false),

  // Oracle AI
  oracleSymbols: text("oracle_symbols"),
  oracleMeaning: text("oracle_meaning"),
  oracleMessage: text("oracle_message"),
  oracleAction: text("oracle_action"),
  oracleDecree: text("oracle_decree"),
  isOracleProcessed: boolean("is_oracle_processed").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── QUICK NOTES ───────────────────────────────────────────────────

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── NUMEROLOGY ────────────────────────────────────────────────────

export const numerologyCalculations = pgTable("numerology_calculations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  calcName: text("calc_name").notNull(),
  birthDate: date("birth_date").notNull(),
  lifePath: integer("life_path").notNull(),
  expressionNum: integer("expression_num").notNull(),
  soulUrgeNum: integer("soul_urge_num").notNull(),
  birthdayNum: integer("birthday_num"),
  personalYear: integer("personal_year"),
  personalMonth: integer("personal_month"),
  personalDay: integer("personal_day"),
  calculationDate: timestamp("calculation_date", { withTimezone: true }).defaultNow(),
});

// ─── FOLLOWERS ─────────────────────────────────────────────────────

export const followers = pgTable("followers", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id").references(() => profiles.id).notNull(),
  followingId: uuid("following_id").references(() => profiles.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── PROPHETIC INBOX ───────────────────────────────────────────────

export const propheticInbox = pgTable("prophetic_inbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => profiles.id).notNull(),
  receiverId: uuid("receiver_id").references(() => profiles.id).notNull(),
  entryId: uuid("entry_id").references(() => journalEntries.id),
  message: text("message"),
  status: text("status").default("pending"),
  response: text("response"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
});

// ─── TREASURY ──────────────────────────────────────────────────────

export const treasury = pgTable("treasury", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  source: text("source").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  description: text("description"),
  status: text("status").default("completed"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── COURTS ────────────────────────────────────────────────────────

export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => profiles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isLive: boolean("is_live").default(false),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  recordingUrl: text("recording_url"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  maxAttendees: integer("max_attendees"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── COURT ATTENDEES ───────────────────────────────────────────────

export const courtAttendees = pgTable("court_attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  courtId: uuid("court_id").references(() => courts.id).notNull(),
  userId: uuid("user_id").references(() => profiles.id).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  leftAt: timestamp("left_at", { withTimezone: true }),
});

// ─── TYPE EXPORTS ──────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NumerologyCalculation = typeof numerologyCalculations.$inferSelect;
export type Follower = typeof followers.$inferSelect;
export type PropheticInboxItem = typeof propheticInbox.$inferSelect;
export type TreasuryItem = typeof treasury.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type CourtAttendee = typeof courtAttendees.$inferSelect;