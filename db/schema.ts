import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	pgEnum,
	uniqueIndex,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// ============================================
// ENUMS
// ============================================

export const accountTypeEnum = pgEnum("account_type", [
	"CASH",
	"BANK",
	"E_WALLET",
	"CREDIT_CARD",
	"INVESTMENT",
]);

export const categoryTypeEnum = pgEnum("category_type", ["INCOME", "EXPENSE"]);

export const transactionTypeEnum = pgEnum("transaction_type", [
	"INCOME",
	"EXPENSE",
]);

export const recurrenceFrequencyEnum = pgEnum("recurrence_frequency", [
	"DAILY",
	"WEEKLY",
	"MONTHLY",
	"YEARLY",
]);

export const debtTypeEnum = pgEnum("debt_type", ["LEND", "BORROW"]);

// ============================================
// TABLES
// ============================================

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	name: text("name").notNull(),
	encryptionSalt: text("encryption_salt"),
	encryptionVerifier: text("encryption_verifier"),
	isDataEncrypted: boolean("is_data_encrypted").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
	"accounts",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: accountTypeEnum("type").notNull(),
		balance: text("balance").default("0").notNull(),
		currency: text("currency").default("IDR").notNull(),
		icon: text("icon"),
		color: text("color"),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const categories = pgTable(
	"categories",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: categoryTypeEnum("type").notNull(),
		icon: text("icon"),
		color: text("color"),
		isDefault: boolean("is_default").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("categories_user_id_idx").on(table.userId),
		index("categories_user_type_idx").on(table.userId, table.type),
	],
);

export const tags = pgTable(
	"tags",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("tags_user_name_idx").on(table.userId, table.name),
		index("tags_user_id_idx").on(table.userId),
	],
);

export const transactions = pgTable(
	"transactions",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accountId: text("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		categoryId: text("category_id").references(() => categories.id, {
			onDelete: "set null",
		}),
		amount: text("amount").notNull(),
		type: transactionTypeEnum("type").notNull(),
		description: text("description").notNull(),
		note: text("note"),
		date: timestamp("date").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("transactions_user_id_idx").on(table.userId),
		index("transactions_user_date_idx").on(table.userId, table.date),
		index("transactions_user_account_idx").on(table.userId, table.accountId),
		index("transactions_user_category_idx").on(table.userId, table.categoryId),
	],
);

// Junction table for transactions <-> tags (many-to-many)
export const transactionTags = pgTable(
	"transaction_tags",
	{
		transactionId: text("transaction_id")
			.notNull()
			.references(() => transactions.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("transaction_tags_idx").on(table.transactionId, table.tagId),
	],
);

export const budgets = pgTable(
	"budgets",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		categoryId: text("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
		amount: text("amount").notNull(),
		month: integer("month").notNull(),
		year: integer("year").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("budgets_unique_idx").on(
			table.userId,
			table.categoryId,
			table.month,
			table.year,
		),
		index("budgets_user_id_idx").on(table.userId),
		index("budgets_user_month_year_idx").on(
			table.userId,
			table.month,
			table.year,
		),
	],
);

export const recurringTransactions = pgTable(
	"recurring_transactions",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accountId: text("account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		categoryId: text("category_id").references(() => categories.id, {
			onDelete: "set null",
		}),
		amount: text("amount").notNull(),
		type: transactionTypeEnum("type").notNull(),
		description: text("description").notNull(),
		frequency: recurrenceFrequencyEnum("frequency").notNull(),
		startDate: timestamp("start_date").notNull(),
		endDate: timestamp("end_date"),
		nextDueDate: timestamp("next_due_date").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("recurring_user_id_idx").on(table.userId),
		index("recurring_active_due_idx").on(
			table.userId,
			table.isActive,
			table.nextDueDate,
		),
	],
);

export const debts = pgTable(
	"debts",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: debtTypeEnum("type").notNull(),
		personName: text("person_name").notNull(),
		amount: text("amount").notNull(),
		remainingAmount: text("remaining_amount").notNull(),
		description: text("description"),
		dueDate: timestamp("due_date"),
		isPaid: boolean("is_paid").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("debts_user_id_idx").on(table.userId),
		index("debts_user_paid_idx").on(table.userId, table.isPaid),
		index("debts_user_type_idx").on(table.userId, table.type),
	],
);

export const transfers = pgTable(
	"transfers",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		fromAccountId: text("from_account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		toAccountId: text("to_account_id")
			.notNull()
			.references(() => accounts.id, { onDelete: "cascade" }),
		amount: text("amount").notNull(),
		fee: text("fee").default("0").notNull(),
		description: text("description").notNull(),
		note: text("note"),
		date: timestamp("date").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("transfers_user_id_idx").on(table.userId),
		index("transfers_user_date_idx").on(table.userId, table.date),
		index("transfers_from_account_idx").on(table.userId, table.fromAccountId),
		index("transfers_to_account_idx").on(table.userId, table.toAccountId),
	],
);

// ============================================
// RELATIONS (for ORM-style queries)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	categories: many(categories),
	transactions: many(transactions),
	tags: many(tags),
	budgets: many(budgets),
	recurringTransactions: many(recurringTransactions),
	debts: many(debts),
	transfers: many(transfers),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
	transactions: many(transactions),
	recurringTransactions: many(recurringTransactions),
	transfersFrom: many(transfers, { relationName: "fromAccount" }),
	transfersTo: many(transfers, { relationName: "toAccount" }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	user: one(users, {
		fields: [categories.userId],
		references: [users.id],
	}),
	transactions: many(transactions),
	budgets: many(budgets),
	recurringTransactions: many(recurringTransactions),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(users, {
		fields: [tags.userId],
		references: [users.id],
	}),
	transactionTags: many(transactionTags),
}));

export const transactionsRelations = relations(
	transactions,
	({ one, many }) => ({
		user: one(users, {
			fields: [transactions.userId],
			references: [users.id],
		}),
		account: one(accounts, {
			fields: [transactions.accountId],
			references: [accounts.id],
		}),
		category: one(categories, {
			fields: [transactions.categoryId],
			references: [categories.id],
		}),
		transactionTags: many(transactionTags),
	}),
);

export const transactionTagsRelations = relations(
	transactionTags,
	({ one }) => ({
		transaction: one(transactions, {
			fields: [transactionTags.transactionId],
			references: [transactions.id],
		}),
		tag: one(tags, {
			fields: [transactionTags.tagId],
			references: [tags.id],
		}),
	}),
);

export const budgetsRelations = relations(budgets, ({ one }) => ({
	user: one(users, {
		fields: [budgets.userId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [budgets.categoryId],
		references: [categories.id],
	}),
}));

export const recurringTransactionsRelations = relations(
	recurringTransactions,
	({ one }) => ({
		user: one(users, {
			fields: [recurringTransactions.userId],
			references: [users.id],
		}),
		account: one(accounts, {
			fields: [recurringTransactions.accountId],
			references: [accounts.id],
		}),
		category: one(categories, {
			fields: [recurringTransactions.categoryId],
			references: [categories.id],
		}),
	}),
);

export const debtsRelations = relations(debts, ({ one }) => ({
	user: one(users, {
		fields: [debts.userId],
		references: [users.id],
	}),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
	user: one(users, {
		fields: [transfers.userId],
		references: [users.id],
	}),
	fromAccount: one(accounts, {
		fields: [transfers.fromAccountId],
		references: [accounts.id],
		relationName: "fromAccount",
	}),
	toAccount: one(accounts, {
		fields: [transfers.toAccountId],
		references: [accounts.id],
		relationName: "toAccount",
	}),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type Debt = typeof debts.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
