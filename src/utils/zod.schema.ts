import * as z from 'zod'

const enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SHOP_OWNER = 'SHOP_OWNER',
}

const enum CurrencyEnum {
  UZS = 'UZS',
  USD = 'USD',
}

const enum ProductType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
}

const enum PriorityType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

//base schema
const BaseSchema = z.object({
  id: z.string().uuid().describe('Primary key'),
  createdAt: z.coerce.date().describe("Time it was created"),
  updatedAt: z.coerce.date().describe("Time it was updated"),
  deletedAt: z.coerce.date().nullable().describe("Time it was deleted"),
});

const BaseSchemaForSwagger = z.object({
  id: z.uuid().describe('Primary key'),
  createdAt: z.iso.datetime().describe("Time it was created"),
  updatedAt: z.iso.datetime().describe("Time it was updated"),
  deletedAt: z.iso.datetime().nullable().describe("Time it was deleted"),
});

type BaseSchemaType = z.infer<typeof BaseSchema>;

const UserSchema = z
  .object({
    email: z.email().describe('User email account').nullable().optional(),
    name: z.string().describe("User name").nullable().optional(),
    phone: z.string().nullable().optional().describe('Phone number of user'),
    role: z
      .enum([UserRoleEnum.USER, UserRoleEnum.ADMIN, UserRoleEnum.SHOP_OWNER])
      .describe("Role might be either 'USER', 'SHOP_OWNER' or 'ADMIN'"),
    emailVerified: z.boolean().default(false).describe("Whether the user email is verified or not"),
    isSuspended: z
      .boolean()
      .default(false)
      .describe('Whether the user is suspended (cannot perform actions)'),
  })
  .extend(BaseSchemaForSwagger.shape);

type UserSchemaType = z.infer<typeof UserSchema>

const MessageSchema = z.object({
  conversationId: z.uuid().describe('Users conversation id'),
  senderId: z.uuid().describe('User sender id'),
  message: z.string().nullable().optional().describe('Text based chat message'),
  imageUrl: z.string().nullable().optional().describe('Chat image url'),
  readAt: z.iso.datetime().nullable().optional().describe("Time the message was read"),
}).extend(BaseSchemaForSwagger.shape);

type MessageSchemaType = z.infer<typeof MessageSchema>;

const ProfileSchema = z.object({
  userId: z.uuid().describe('User id'),
  googleId: z.string().nullable().optional().describe('User account google id'),
  facebookId: z.string().nullable().optional().describe('User account facebook id'),
  fcmToken: z.string().nullable().optional().describe('User fcm token for notifications'),
  regionId: z.string().nullable().optional().describe("User region id")
}).extend(BaseSchemaForSwagger.shape)

type ProfileSchemaType = z.infer<typeof ProfileSchema>

const ShopProfileSchema = z
  .object({
    userId: z.uuid().describe('User id'),
    shopName: z.string().describe('Name of the shop'),
    description: z.string().nullable().optional().describe('Shop description'),
    taxIdNumber: z.string().nullable().optional().describe('Tax ID number'),
    contactName: z.string().nullable().optional().describe('Contact person name'),
    address: z.string().nullable().optional().describe('Shop address'),
    phone: z.string().describe('Phone number'),
    bannerUrl: z.string().nullable().optional().describe('Banner image URL'),
    profileUrl: z.string().nullable().optional().describe('Profile image URL'),
    isOnline: z.boolean().default(false).describe('Whether the shop is online'),
    facebookLink: z.string().nullable().optional().describe('Facebook link'),
    telegramLink: z.string().nullable().optional().describe('Telegram link'),
    instagramLink: z.string().nullable().optional().describe('Instagram link'),
    website: z.string().nullable().optional().describe('Website link'),
    verified: z.boolean().default(false).describe('Whether the shop is verified'),
    rating: z.number().default(0).describe('Average rating of the shop'),
    subscribers: z.number().int().default(0).describe('Number of subscribers'),
    totalReviews: z.number().int().default(0).describe('Number of total reviews'),
    views: z.number().int().default(0).describe('Number of profile views'),
    latitude: z.number().nullable().optional().describe('Latitude'),
    longitude: z.number().nullable().optional().describe('Longitude'),
  })
  .extend(BaseSchemaForSwagger.shape);

type ShopProfileSchemaType = z.infer<typeof ShopProfileSchema>;

export const NotificationSchema = z
  .object({
    receiverId: z.uuid().nullable().optional().describe('User ID who receives the notification'),
    senderId: z.uuid().nullable().optional().describe('User ID who sent the notification'),
    type: z.string().describe('Type of the notification (e.g., message, alert, system)'),
    content: z.string().describe('Main content or message of the notification'),
    hasBeenSeen: z.boolean().default(false).describe('Whether the notification has been seen'),
    isGlobal: z.boolean().default(false).describe('Whether this is a global notification visible to all users'),
    referenceId: z.string().nullable().optional().describe('Reference ID related to another entity (e.g., post, order, etc.)'),
    priority: z
      .enum([PriorityType.HIGH, PriorityType.MEDIUM, PriorityType.LOW])
      .default(PriorityType.MEDIUM)
      .describe('Priority of the notification'),
    expiresAt: z.iso.datetime().nullable().optional().describe('When this notification expires'),
    metadata: z
      .record(z.string(), z.any())
      .nullable()
      .optional()
      .describe('Additional metadata stored as JSONB'),
    date: z.iso.datetime().nullable().optional().describe('Creation date of the notification'),
  })
  .extend(BaseSchemaForSwagger.shape);

export type NotificationSchemaType = z.infer<typeof NotificationSchema>;

export const ConversationItemSchema = z
  .object({
    userOneId: z.uuid().describe('ID of the first user'),
    userTwoId: z.uuid().describe('ID of the second user'),
    userOne: UserSchema.describe('User One details'),
    userTwo: UserSchema.describe('User Two details'),
    phoneNumber: z.string().describe('Phone number of the other user'),
    lastMessage: z.string().describe('Last message content'),
    lastMessageDate: z.string().describe('Formatted date of the last message'),
    isShop: z.boolean().describe('Whether the other user is a shop'),
    shopProfile: ShopProfileSchema.nullable().optional().describe('Shop profile if user is a shop'),
    userProfile: ProfileSchema.nullable().optional().describe('Profile of the other user'),
    isAlreadySubscriber: z.boolean().describe('Whether the current user has subscribed to the shop'),
    hasAlreadyRated: z.boolean().describe('Whether the current user has rated the shop'),
  })
  .extend(BaseSchemaForSwagger.shape);

export type ConversationItemSchemaType = z.infer<typeof ConversationItemSchema>;

const RegionSchema = z.object({
  name: z.string().describe('Region name'),
  parentId: z.uuid().nullable().optional().describe('Region parent id'),
  slug: z.string().describe('Region slugname'),
}).extend(BaseSchemaForSwagger.shape)

type RegionSchemaType = z.infer<typeof RegionSchema>

const CategorySchema = z.object({
  name: z.string().describe('Category name'),
  parentId: z.uuid().nullable().optional().describe('Parent category id'),
  slug: z.string().describe('Category slug name'),
  imageUrl: z.string().nullable().optional().describe('Category url of image'),
}).extend(BaseSchemaForSwagger.shape);

type CategorySchemaType = z.infer<typeof CategorySchema>

export const AttributeValueSchema = z.object({
  id: z.uuid(),
  value: z.string(),
  slug: z.string(),
});

export type AttributeValueSchemaType = z.infer<typeof AttributeValueSchema>

export const AttributeWithValuesSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  values: AttributeValueSchema.array(),
});

export type AttributeWithValuesSchemaType = z.infer<typeof AttributeWithValuesSchema>

export const AttributeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const CreateAttributeSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const AttachAttributeToCategorySchema = z.object({
  categoryId: z.uuid(),
  attributeId: z.uuid(),
});


export const AttachValueToAttributeSchema = z.object({
  attributeId: z.uuid(),
  attributeValueId: z.uuid(),
});

export const CreateAttributeValueSchema = z.object({
  value: z.string(),
  slug: z.string(),
});

const ProductSchema = z.object({
  categoryId: z.uuid(),
  userId: z.uuid(),
  regionId: z.uuid(),

  name: z.string(),
  slug: z.string(),
  description: z.string(),

  price: z.string().nullable().optional(),
  currency: z
    .enum([CurrencyEnum.USD, CurrencyEnum.UZS])
    .nullable()
    .optional(),

  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),

  isUrgent: z.coerce.boolean().default(false),
  enableTelegram: z.coerce.boolean().default(true),

  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),

  facebookPostId: z.string().nullable().optional(),
  telegramPostId: z.string().nullable().optional(),
  instagramPostId: z.string().nullable().optional(),
}).extend(BaseSchemaForSwagger.shape);

type ProductSchemaType = z.infer<typeof ProductSchema>

const PaginationResponseSchema = z
  .object({
    limit: z.number().int().min(1).max(100),
    page: z.number().int().min(1),
    total: z.number().int().min(0),
    pages: z.number().int().min(0),
  })
  .describe('Pagination response schema');

const PaginationQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    page: z.coerce.number().int().min(1).default(1),
  })
  .describe('Pagination query schema');

// interceptors and filters
const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema ? dataSchema.optional() : z.any().optional(),
    timestamp: z.string(),
  });

type SuccessResponseSchemaType<T = z.ZodTypeAny> = z.infer<
  ReturnType<typeof SuccessResponseSchema<z.ZodType<T>>>
>;

const ErrorDetailsSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

type ErrorDetailsSchemaType = z.infer<typeof ErrorDetailsSchema>;

const BaseErrorResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema.nullable(),
    errors: z.array(ErrorDetailsSchema).nullable().optional(),
    timestamp: z.string(),
    path: z.string(),
  });

type BaseErrorResponseSchemaType = z.infer<
  ReturnType<typeof BaseErrorResponseSchema<z.ZodTypeAny>>
>;

const DatabaseErrorSchema = z.object({
  code: z.string().optional(),
  constraint: z.string().optional(),
  detail: z.string().optional(),
  table: z.string().optional(),
  column: z.string().optional(),
});

type DatabaseErrorSchemaType = z.infer<typeof DatabaseErrorSchema>;

export {
    BaseSchema,
    type BaseSchemaType,
    UserRoleEnum,
    ProductType,
    CurrencyEnum,
    PriorityType,
    UserSchema,
    type UserSchemaType,
    SuccessResponseSchema,
    type SuccessResponseSchemaType,
    ErrorDetailsSchema,
    type ErrorDetailsSchemaType,
    BaseErrorResponseSchema,
    type BaseErrorResponseSchemaType,
    DatabaseErrorSchema,
    type DatabaseErrorSchemaType,
    CategorySchema,
    type CategorySchemaType,
    PaginationResponseSchema,
    BaseSchemaForSwagger,
    PaginationQuerySchema,
    ProfileSchema,
    type ProfileSchemaType,
    RegionSchema,
    type RegionSchemaType,
    ProductSchema,
    type ProductSchemaType,
    MessageSchema,
    type MessageSchemaType,
    ShopProfileSchema,
    type ShopProfileSchemaType,
}