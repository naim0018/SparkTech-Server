export type TProduct = {
    title: string;                     // The name of the product
    description: Record<string, string>;// Key-value pairs for product details
    price: number;                     // Base price of the product
    discountAmount?: number;           // Amount of discount applied
    discountPrice?: number;            // Price after discount
    productCode: number;               // Unique identifier for the product (SKU, UPC, etc.)
    category: string;                  // Category to which the product belongs
    subCategory?: string;              // Optional subcategory for more specific classification
    images: string[];                  // Array of image URLs for the product
    stockQuantity: number;             // Number of units available in stock
    rating?: number;                   // Average rating of the product
    // reviews?: TReview[];               // Array of customer reviews
    specifications?: Record<string, string>; // Detailed technical specifications
    brand?: string;                    // Brand name (if applicable)
    tags?: string[];                   // Tags or keywords associated with the product
    isFeatured?: boolean;              // Whether the product is featured on the website
    isOnSale?: boolean;                // Whether the product is on sale
    shippingDetails?: TShippingDetails; // Shipping information like weight, dimensions, etc.
    variants?: TVariant[];             // Different variants of the product (e.g., size, color)
    createdAt: Date;                   // Date when the product was added
    updatedAt: Date;                   // Date when the product was last updated
  };
  
//  export type TReview = {
//     user: string;                      // Name or ID of the user who wrote the review
//     rating: number;                    // Rating given by the user
//     comment: string;                   // Review comment
//     date: Date;                        // Date when the review was submitted
//   };
  
 export type TShippingDetails = {
    weight: number;                    // Weight of the product (in grams, kilograms, etc.)
    dimensions: {                      // Dimensions of the product
      length: number;                  // Length of the product
      width: number;                   // Width of the product
      height: number;                  // Height of the product
    };
    freeShipping?: boolean;            // Whether the product qualifies for free shipping
    estimatedDelivery?: string;        // Estimated delivery time
  };
  
 export type TVariant = {
    variantName: string;               // Name of the variant (e.g., "Size", "Color")
    options: string[];                 // Options available for the variant (e.g., ["S", "M", "L"])
  };
  