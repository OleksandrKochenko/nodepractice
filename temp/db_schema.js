const product = {
  _id: ObjectId(),
  title: String,
  description: String,
  // ... other common product fields ...
  variants: {
    md: {
      price: Number,
      weight: Number, // in grams or other unit
      quantity: Number, // number of pieces in the md package
    },
    lg: {
      price: Number,
      weight: Number,
      quantity: Number,
    },
    xl: {
      price: Number,
      weight: Number,
      quantity: Number,
    },
  },
  stores_availability: [
    {
      store_id: ObjectId(), // Reference to the Stores collection
      variants_stock: {
        md: {
          count: Number, // Count of 'md' packages in this store
        },
        lg: {
          count: Number,
        },
        xl: {
          count: Number,
        },
      },
    },
  ],
  // ... potentially other fields like category_id, image_url, etc.
};

const store = {
  _id: ObjectId(),
  name: String,
  location: String,
  contact_info: {
    phone: String,
    email: String,
  },
  operating_hours: {
    open: String, // e.g., "09:00 AM"
    close: String, // e.g., "09:00 PM"
  },
  // ... other store-specific fields ...
};
