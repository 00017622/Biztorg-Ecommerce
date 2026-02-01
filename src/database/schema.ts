import { relations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/pg-core';
import { doublePrecision } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';
import { numeric } from 'drizzle-orm/pg-core';
import { uniqueIndex, customType } from 'drizzle-orm/pg-core';
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  decimal,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { UserRoleEnum, CurrencyEnum, ProductType, UserSchema, PriorityType } from 'src/utils/zod.schema';

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// enums
export const DrizzleUserRoleEnum = pgEnum('user_role', [
    UserRoleEnum.ADMIN,
    UserRoleEnum.USER,
    UserRoleEnum.SHOP_OWNER
]);

export const DrizzleCurrencyEnum = pgEnum('currency', [
    CurrencyEnum.USD,
    CurrencyEnum.UZS
]);

export const DrizzleProductType = pgEnum('product_type', [
    ProductType.PURCHASE,
    ProductType.SALE
]);

export const DrizzlePriorityEnum = pgEnum('priority_type', [
  PriorityType.HIGH,
  PriorityType.MEDIUM,
  PriorityType.LOW
]);

// schemas
const baseSchema = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
};

export const usersSchema = pgTable('users', {
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  phone: varchar('phone', { length: 20 }).unique(),
  name: text('name'),
  role: DrizzleUserRoleEnum('role').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  isSuspended: boolean('is_suspended').notNull().default(false),
  ...baseSchema,
});

export const profilesSchema = pgTable('profiles', {
    userId: uuid('user_id').notNull().references(() => usersSchema.id, {
        onDelete: 'cascade',
    }),
    googleId: text('google_id'),
    facebookId: text('facebook_id'),
    fcmToken: text('fcm_token'),
    regionId: uuid('region_id').references(() => regionsSchema.id),
   ...baseSchema
})

export const tempPhoneCredentialsSchema = pgTable('temp_phone_credentials', {
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  requestId: varchar('request_id', {length: 255}).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...baseSchema
})

export const conversationsSchema = pgTable('conversations', {
  userOneId: uuid('user_one_id').notNull().references(() => usersSchema.id, {
        onDelete: 'cascade',
    }),
  userTwoId: uuid('user_two_id').notNull().references(() => usersSchema.id, {
        onDelete: 'cascade',
    }),
  ...baseSchema
})

export const messagesSchema = pgTable('messages', {
  conversationId: uuid('conversation_id').notNull().references(() => conversationsSchema.id, {
        onDelete: 'cascade',
    }),
  senderId: uuid('sender_id').notNull().references(() => usersSchema.id, {
    onDelete: 'cascade',
  }),
  message: text("message"),
  imageUrl: varchar('image_url', { length: 255 }),
  readAt: timestamp('read_at', { mode: 'date', withTimezone: true }),
  ...baseSchema
})

export const notificationsSchema = pgTable("notifications", {
  receiverId: uuid("receiver_id")
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .references(() => usersSchema.id, { onDelete: "set null" }),
  type: varchar("type").notNull(),
  content: text("content").notNull(),
  hasBeenSeen: boolean("has_been_seen").default(false).notNull(),
  isGlobal: boolean("is_global").default(false).notNull(),
  referenceId: varchar("reference_id"),
  priority: DrizzlePriorityEnum("priority").default(PriorityType.MEDIUM).notNull(),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  date: timestamp("date").defaultNow().notNull(),
  ...baseSchema
});

export const shopProfilesSchema = pgTable('shop_profiles', {
  userId: uuid('user_id').notNull().references(() => usersSchema.id, {
        onDelete: 'cascade',
    }),
  shopName: varchar('shop_name', { length: 255 }).notNull(),
  description: text('description'),
  taxIdNumber: varchar('tax_id_number', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  address: varchar('address', { length: 255 }),
  phone: varchar('phone', { length: 50 }).notNull(),
  bannerUrl: varchar('banner_url', { length: 255 }),
  profileUrl: varchar('profile_url', { length: 255 }),
  isOnline: boolean('is_online').default(false).notNull(),
  facebookLink: varchar('facebook_link', { length: 255 }),
  telegramLink: varchar('telegram_link', { length: 255 }),
  instagramLink: varchar('instagram_link', { length: 255 }),
  website: varchar('website', { length: 255 }),
  verified: boolean('verified').default(false).notNull(),
  rating: doublePrecision('rating').default(0.0).notNull(),
  subscribers: integer('subscribers').default(0).notNull(),
  totalReviews: integer('total_reviews').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  ...baseSchema
});

export const shopSubscriptionsSchema = pgTable('shop_subscriptions', {
  userId: uuid('user_id').notNull().references(() => usersSchema.id, {
        onDelete: 'cascade',
    }),
  shopId: uuid('shop_id')
    .notNull()
    .references(() => shopProfilesSchema.id, { onDelete: 'cascade' }),
  ...baseSchema
});

export const shopRatingsSchema = pgTable(
  "shop_ratings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    shopProfileId: uuid("shop_profile_id")
      .notNull()
      .references(() => shopProfilesSchema.id, { onDelete: "cascade" }),
    rating: integer("rating")
      .notNull(),
    ...baseSchema,
  },
  (table) => [
    uniqueIndex("unique_user_shop_rating").on(table.userId, table.shopProfileId),
  ]
);

export const regionsSchema = pgTable('regions', {
    name: text('name').notNull(),
    parentId: uuid('parent_id'),
    slug: text('slug').unique().notNull(),
    ...baseSchema
},

(table) => [
  index("regions_parent_idx").on(table.parentId)
]
)

export const categoriesSchema = pgTable('categories', {
    parentId: uuid('parent_id').references(() => categoriesSchema.id, {
        onDelete: 'cascade',
    }),

    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    imageUrl: text('image_url'),

    ...baseSchema,
},

(table) => [
    index("categories_parent_idx").on(table.parentId)
]
)

export const productsSchema = pgTable('products', {
    categoryId: uuid('category_id')
        .notNull()
        .references(() => categoriesSchema.id),
    userId: uuid('user_id').notNull().references(() => usersSchema.id),
    shopId: uuid('shop_id')
    .references(() => shopProfilesSchema.id),
    regionId: uuid('region_id').notNull().references(() => regionsSchema.id),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    price: decimal('price'),
    currency: DrizzleCurrencyEnum('currency'),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    isUrgent: boolean('is_urgent').notNull().default(false),
    contactName: text('contact_name'),
    contactPhone: text('contact_phone'),
    enableTelegram: boolean('enable_telegram').notNull().default(true),


    facebookPostId: varchar("facebook_post_id", { length: 255 }),
    telegramPostId: varchar("telegram_post_id", { length: 255 }),
    instagramPostId: varchar("instagram_post_id", { length: 255 }),

    ...baseSchema,
    searchVector: tsvector("search_vector"),
},

(table) => [
    index('products_category_idx').on(table.categoryId),
    index('products_region_idx').on(table.regionId),
    index('products_user_idx').on(table.userId),
    index('products_price_idx').on(table.price),
    index('products_urgent_idx').on(table.isUrgent),
]
)

export const productImagesSchema = pgTable('product_images', {
    productId: uuid('product_id').notNull().references(() => productsSchema.id, {onDelete: 'cascade'}),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    isMain: boolean('is_main').notNull().default(false),
    ...baseSchema
})

export const attributesSchema = pgTable(
  'attributes',
  {
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    ...baseSchema
  },
  (table) => [
    uniqueIndex('attributes_slug_unique').on(table.slug),
  ]
);

export const attributeValuesSchema = pgTable(
  'attribute_values',
  {
    value: varchar('value', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    ...baseSchema
  },
  (table) => [
    uniqueIndex('attribute_values_slug_unique').on(table.slug),
  ]
);

export const categoryAttributesSchema = pgTable(
  'category_attributes',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categoriesSchema.id, { onDelete: 'cascade' }),

    attributeId: uuid('attribute_id')
      .notNull()
      .references(() => attributesSchema.id, { onDelete: 'cascade' }),

    ...baseSchema
  },
  (table) => [
    uniqueIndex('category_attribute_unique')
      .on(table.categoryId, table.attributeId),
  ]
);

export const attributeAttributeValuesSchema = pgTable(
  'attribute_attribute_values',
  {
    attributeId: uuid('attribute_id')
      .notNull()
      .references(() => attributesSchema.id, { onDelete: 'cascade' }),

    attributeValueId: uuid('attribute_value_id')
      .notNull()
      .references(() => attributeValuesSchema.id, { onDelete: 'cascade' }),

    ...baseSchema
  },
  (table) => [
    uniqueIndex('attribute_value_unique')
      .on(table.attributeId, table.attributeValueId),
  ]
);

export const categoryAttributeValuesSchema = pgTable(
  'category_attribute_values',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categoriesSchema.id, { onDelete: 'cascade' }),

    attributeId: uuid('attribute_id')
      .notNull()
      .references(() => attributesSchema.id, { onDelete: 'cascade' }),

    attributeValueId: uuid('attribute_value_id')
      .notNull()
      .references(() => attributeValuesSchema.id, { onDelete: 'cascade' }),

    ...baseSchema,
  },
  (table) => [
    uniqueIndex('category_attribute_value_unique')
      .on(table.categoryId, table.attributeId, table.attributeValueId),
  ]
);

export const productsAttributeValuesSchema = pgTable("product_attribute_values", {
    productId: uuid('product_id').notNull().references(() => productsSchema.id, {onDelete: 'cascade'}),
    attributeValueId: uuid('attribute_value_id').notNull().references(() => attributeValuesSchema.id,  {onDelete: 'cascade'}),
    ...baseSchema
}, (table) => [
    uniqueIndex("product_attribute_values_product_id_attribute_value_id_idx")
    .on(table.productId, table.attributeValueId),
  ]);

export const favoriteProductsSchema = pgTable('favorites', {
    userId: uuid('user_id').notNull().references(() => usersSchema.id, {onDelete: 'cascade'}),
    productId: uuid('product_id').notNull().references(() => productsSchema.id, {onDelete: 'cascade'}),
    ...baseSchema
})

export const tempCredentialsSchema = pgTable("temp_credentials", {
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...baseSchema,
});

//relations
// user-profile relations
export const usersRelations = relations(usersSchema, ({ one, many }) => ({
  profile: one(profilesSchema, {
    fields: [usersSchema.id],
    references: [profilesSchema.userId],
    relationName: "user_profile",
  }),
  shopProfile: one(shopProfilesSchema, {
    fields: [usersSchema.id],
    references: [shopProfilesSchema.userId],
    relationName: "user_shopprofile"
  }),
  favorites: many(favoriteProductsSchema, {
    relationName: "user_favorites",
  }),
  products: many(productsSchema, {
    relationName: "user_products",
  }),
    subscriptions: many(shopSubscriptionsSchema, {
    relationName: "user_subscriptions",
  }),
  sentMessages: many(messagesSchema, {
    relationName: "message_sender",
  }),

  receivedNotifications: many(notificationsSchema, {
    relationName: "notification_receiver",
  }),

  sentNotifications: many(notificationsSchema, {
    relationName: "notification_sender",
  }),
   shopRatings: many(shopRatingsSchema, {
    relationName: "user_shop_ratings",
  }),
}));

export const profilesRelations = relations(profilesSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [profilesSchema.userId],
    references: [usersSchema.id],
    relationName: "user_profile",
  }),
  region: one(regionsSchema, {
    fields: [profilesSchema.regionId],
    references: [regionsSchema.id],
    relationName: "region_profiles",
  }),
 
}));

export const shopProfileRelations = relations(shopProfilesSchema, ({one, many}) => ({
  user: one(usersSchema, {
    fields: [shopProfilesSchema.userId],
    references: [usersSchema.id],
    relationName: "user_shopprofile"
  }),
  subscriptions: many(shopSubscriptionsSchema, {
    relationName: "shop_subscriptions",
  }),
    ratings: many(shopRatingsSchema, {
      relationName: "shop_profile_ratings",
    }),
}))

export const shopSubscriptionsRelations = relations(shopSubscriptionsSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [shopSubscriptionsSchema.userId],
    references: [usersSchema.id],
    relationName: "user_subscriptions",
  }),
  shop: one(shopProfilesSchema, {
    fields: [shopSubscriptionsSchema.shopId],
    references: [shopProfilesSchema.id],
    relationName: "shop_subscriptions",
  }),
}));

export const shopRatingsRelations = relations(
  shopRatingsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [shopRatingsSchema.userId],
      references: [usersSchema.id],
      relationName: "user_shop_ratings",
    }),
    shopProfile: one(shopProfilesSchema, {
      fields: [shopRatingsSchema.shopProfileId],
      references: [shopProfilesSchema.id],
      relationName: "shop_profile_ratings",
    }),
  })
);

export const conversationsRelations = relations(conversationsSchema, ({one, many}) => ({
  userOne: one(usersSchema, {
    fields: [conversationsSchema.userOneId],
    references: [usersSchema.id],
    relationName: "conversation_user_one",
  }),
  userTwo: one(usersSchema, {
    fields: [conversationsSchema.userTwoId],
    references: [usersSchema.id],
    relationName: "conversation_user_two",
  }),
  messages: many(messagesSchema)
}))

export const messagesRelations = relations(messagesSchema, ({ one }) => ({
  conversation: one(conversationsSchema, {
    fields: [messagesSchema.conversationId],
    references: [conversationsSchema.id],
  }),
  sender: one(usersSchema, {
    fields: [messagesSchema.senderId],
    references: [usersSchema.id],
  }),
}));

export const notificationsRelations = relations(notificationsSchema, ({ one }) => ({
  receiver: one(usersSchema, {
    fields: [notificationsSchema.receiverId],
    references: [usersSchema.id],
    relationName: "notification_receiver",
  }),
  sender: one(usersSchema, {
    fields: [notificationsSchema.senderId],
    references: [usersSchema.id],
    relationName: "notification_sender",
  }),
}));


// regions relations
export const regionsRelations = relations(regionsSchema, ({ one, many }) => ({
  parent: one(regionsSchema, {
    fields: [regionsSchema.parentId],
    references: [regionsSchema.id],
    relationName: "region_parent",
  }),
  children: many(regionsSchema, {
    relationName: "region_children",
  }),
  profiles: many(profilesSchema, {
    relationName: "region_profiles",
  }),
  products: many(productsSchema, {
    relationName: "region_products",
  }),
}));

// product relations
export const productsRelations = relations(productsSchema, ({ one, many }) => ({
   category: one(categoriesSchema, {
  fields: [productsSchema.categoryId],
  references: [categoriesSchema.id],
  relationName: 'product_category_one',
}),
  user: one(usersSchema, {
    fields: [productsSchema.userId],
    references: [usersSchema.id],
    relationName: "user_products",
  }),
  attributeValues: many(productsAttributeValuesSchema, {
    relationName: "product_attribute_values",
  }),
  favorites: many(favoriteProductsSchema, {
    relationName: "product_favorites",
  }),
  images: many(productImagesSchema, {
    relationName: "product_images",
  }),
  region: one(regionsSchema, {
    fields: [productsSchema.regionId],
    references: [regionsSchema.id],
    relationName: "region_products",
  }),
}));

// product images relations
export const productImagesRelations = relations(productImagesSchema, ({ one }) => ({
  product: one(productsSchema, {
    fields: [productImagesSchema.productId],
    references: [productsSchema.id],
    relationName: "product_images",
  }),
}));

// favorite products relations
export const favoriteProductsRelations = relations(favoriteProductsSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [favoriteProductsSchema.userId],
    references: [usersSchema.id],
    relationName: "user_favorites",
  }),
  product: one(productsSchema, {
    fields: [favoriteProductsSchema.productId],
    references: [productsSchema.id],
    relationName: "product_favorites",
  }),
}));

// categories relations
export const categoriesRelations = relations(categoriesSchema, ({ one, many }) => ({
    parent: one(categoriesSchema, {
        fields: [categoriesSchema.parentId],
        references: [categoriesSchema.id],
        relationName: 'category_parent',
    }),

    children: many(categoriesSchema, {
        relationName: 'category_parent',
    }),

    products: many(productsSchema, {
  relationName: 'category_products_many',
}),

  categoryAttributes: many(categoryAttributesSchema, {
    relationName: 'category_attributes',
  }),
}))

export const attributesRelations = relations(attributesSchema, ({ many }) => ({
  categories: many(categoryAttributesSchema, {
    relationName: 'attribute_categories',
  }),
  values: many(attributeAttributeValuesSchema, {
    relationName: 'attribute_values',
  }),
}));

export const attributeValuesRelations = relations(attributeValuesSchema, ({ one, many }) => ({
  attributes: many(attributeAttributeValuesSchema),
  products: many(productsAttributeValuesSchema, {
    relationName: 'attribute_value_products',
  }),
}));

export const categoryAttributesRelations = relations(
  categoryAttributesSchema,
  ({ one }) => ({
    category: one(categoriesSchema, {
      fields: [categoryAttributesSchema.categoryId],
      references: [categoriesSchema.id],
      relationName: 'category_attributes',
    }),
    attribute: one(attributesSchema, {
      fields: [categoryAttributesSchema.attributeId],
      references: [attributesSchema.id],
      relationName: 'attribute_categories',
    }),
  })
);

export const attributeAttributeValuesRelations = relations(
  attributeAttributeValuesSchema,
  ({ one }) => ({
    attribute: one(attributesSchema, {
      fields: [attributeAttributeValuesSchema.attributeId],
      references: [attributesSchema.id],
      relationName: 'attribute_values',
    }),
    value: one(attributeValuesSchema, {
      fields: [attributeAttributeValuesSchema.attributeValueId],
      references: [attributeValuesSchema.id],
    }),
  })
);

// product attribute values pivot relations
export const productsAttributeValuesRelations = relations(productsAttributeValuesSchema, ({ one }) => ({
  product: one(productsSchema, {
    fields: [productsAttributeValuesSchema.productId],
    references: [productsSchema.id],
    relationName: "product_attribute_values",
  }),
  attributeValue: one(attributeValuesSchema, {
    fields: [productsAttributeValuesSchema.attributeValueId],
    references: [attributeValuesSchema.id],
    relationName: "attribute_value_products",
  }),
}));

