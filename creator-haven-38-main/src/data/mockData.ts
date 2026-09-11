export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  coverImage: string;
  category: string;
  tags: string[];
  seller: User;
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
}

export const CATEGORIES = [
  "Design", "Drawing & Painting", "Software Development", "Self Improvement",
  "Fiction Books", "Education", "Comics & Graphic Novels", "Fitness & Health",
  "Music & Sound Design", "Photography", "Films", "Business & Money",
  "3D", "Audio", "Gaming", "Recorded Music",
];

export const MOCK_USERS: User[] = [
  { id: "1", name: "Sahil Lavingia", email: "sahil@digistore.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sahil", bio: "CEO of DigiStore. Writer. Painter. Building tools for creators.", createdAt: "2023-01-01" },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya", bio: "UI/UX Designer creating beautiful design systems and templates.", createdAt: "2023-03-15" },
  { id: "3", name: "Arjun Mehta", email: "arjun@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun", bio: "Full-stack developer sharing courses and boilerplates.", createdAt: "2023-06-20" },
  { id: "4", name: "Neha Gupta", email: "neha@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neha", bio: "Author and illustrator. Creating comics and graphic novels.", createdAt: "2023-08-10" },
  { id: "5", name: "Rohan Kapoor", email: "rohan@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rohan", bio: "Music producer and sound designer. Making beats since 2015.", createdAt: "2023-02-28" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "The Complete UI Design System", description: "A comprehensive design system with 500+ components, tokens, and guidelines for building modern web applications. Includes Figma files, documentation, and code snippets.", price: 4999, currency: "INR", coverImage: "", category: "Design", tags: ["design", "figma", "ui-kit"], seller: MOCK_USERS[1], rating: 4.8, reviewCount: 124, salesCount: 890, createdAt: "2024-01-15" },
  { id: "2", name: "React & Node.js Masterclass", description: "Learn full-stack development from scratch. 40+ hours of video content covering React, Node.js, MongoDB, and deployment.", price: 2999, currency: "INR", coverImage: "", category: "Software Development", tags: ["react", "nodejs", "fullstack"], seller: MOCK_USERS[2], rating: 4.6, reviewCount: 89, salesCount: 567, createdAt: "2024-02-20" },
  { id: "3", name: "Midnight Tales - Comic Collection", description: "A collection of 12 dark fantasy comics with stunning illustrations. PDF and CBZ formats included.", price: 799, currency: "INR", coverImage: "", category: "Comics & Graphic Novels", tags: ["comics", "fantasy", "illustration"], seller: MOCK_USERS[3], rating: 4.9, reviewCount: 56, salesCount: 234, createdAt: "2024-03-10" },
  { id: "4", name: "Lo-Fi Beats Sample Pack", description: "200+ royalty-free lo-fi samples, loops, and one-shots. Perfect for music producers and content creators.", price: 1499, currency: "INR", coverImage: "", category: "Music & Sound Design", tags: ["music", "samples", "lofi"], seller: MOCK_USERS[4], rating: 4.7, reviewCount: 78, salesCount: 445, createdAt: "2024-01-28" },
  { id: "5", name: "Startup Fundraising Playbook", description: "The definitive guide to raising your first round. Includes pitch deck templates, investor email scripts, and term sheet breakdowns.", price: 1999, currency: "INR", coverImage: "", category: "Business & Money", tags: ["startup", "fundraising", "business"], seller: MOCK_USERS[0], rating: 4.5, reviewCount: 167, salesCount: 1200, createdAt: "2024-04-05" },
  { id: "6", name: "Digital Watercolor Brushes", description: "50 hand-crafted Procreate brushes that simulate real watercolor effects. Includes tutorial videos.", price: 599, currency: "INR", coverImage: "", category: "Drawing & Painting", tags: ["procreate", "brushes", "watercolor"], seller: MOCK_USERS[1], rating: 4.8, reviewCount: 92, salesCount: 678, createdAt: "2024-02-14" },
  { id: "7", name: "Python for Data Science", description: "Complete Python data science curriculum with real-world projects. Pandas, NumPy, Matplotlib, and Scikit-learn.", price: 3499, currency: "INR", coverImage: "", category: "Software Development", tags: ["python", "data-science", "ml"], seller: MOCK_USERS[2], rating: 4.4, reviewCount: 134, salesCount: 890, createdAt: "2024-03-22" },
  { id: "8", name: "30-Day Fitness Challenge", description: "Transform your body in 30 days with this structured workout plan. Includes video demonstrations and meal plans.", price: 999, currency: "INR", coverImage: "", category: "Fitness & Health", tags: ["fitness", "workout", "health"], seller: MOCK_USERS[3], rating: 4.6, reviewCount: 45, salesCount: 312, createdAt: "2024-04-01" },
  { id: "9", name: "Minimalist Icon Pack", description: "1000+ pixel-perfect minimalist icons in SVG and PNG formats. Light and dark variants included.", price: 899, currency: "INR", coverImage: "", category: "Design", tags: ["icons", "svg", "minimal"], seller: MOCK_USERS[1], rating: 4.7, reviewCount: 67, salesCount: 534, createdAt: "2024-01-30" },
  { id: "10", name: "Creative Writing Workshop", description: "Learn the art of storytelling through 20 guided exercises. From character development to plot structure.", price: 1299, currency: "INR", coverImage: "", category: "Education", tags: ["writing", "creative", "storytelling"], seller: MOCK_USERS[0], rating: 4.3, reviewCount: 38, salesCount: 189, createdAt: "2024-05-10" },
  { id: "11", name: "3D Character Modeling Course", description: "Master Blender 3D character modeling from beginner to advanced. 25+ hours of content.", price: 3999, currency: "INR", coverImage: "", category: "3D", tags: ["blender", "3d", "modeling"], seller: MOCK_USERS[2], rating: 4.8, reviewCount: 53, salesCount: 267, createdAt: "2024-02-05" },
  { id: "12", name: "Street Photography Presets", description: "24 professional Lightroom presets for urban and street photography. Desktop and mobile compatible.", price: 699, currency: "INR", coverImage: "", category: "Photography", tags: ["lightroom", "presets", "photography"], seller: MOCK_USERS[4], rating: 4.5, reviewCount: 82, salesCount: 456, createdAt: "2024-03-18" },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "1", rating: 5, comment: "Absolutely incredible design system. Saved me weeks of work!", user: MOCK_USERS[0], createdAt: "2024-05-01" },
  { id: "2", rating: 4, comment: "Great course content, though some sections could use more depth.", user: MOCK_USERS[3], createdAt: "2024-04-28" },
  { id: "3", rating: 5, comment: "The best sample pack I've ever purchased. Worth every penny.", user: MOCK_USERS[1], createdAt: "2024-05-05" },
  { id: "4", rating: 5, comment: "Changed my perspective on fundraising completely.", user: MOCK_USERS[2], createdAt: "2024-05-10" },
  { id: "5", rating: 4, comment: "Beautiful illustrations but wish there were more pages.", user: MOCK_USERS[4], createdAt: "2024-04-15" },
];

export const formatPrice = (price: number, currency: string = "INR") => {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${(price / 100).toFixed(2)}`;
};
