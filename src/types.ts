export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit?: string | null;
  image: string;
  astm_value?: string;
  uns_value?: string;
  dimensions?: string;
  applications?: string[] | null;
  stock: number;
  is_featured: boolean;
  created_at: string;
  /**
   * Per-product SEO copy. Optional throughout: a product need not target a phrase, and these
   * columns are absent entirely on a database that has not run the add_product_seo_columns
   * migration. src/lib/productSeo.ts falls back to PRODUCT_KEYWORD_BLOCKS when they are empty.
   */
  seo_heading?: string | null;
  seo_meta_description?: string | null;
  seo_paragraphs?: string[] | null;
  seo_keywords?: string[] | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Country {
  code: string;
  dial_code: string;
  flag: string;
  name: string;
}

export interface Ad {
  id: number;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  image_url?: string | null;
  badge?: string | null;
  discount_percent?: number | null;
  show_banner?: boolean | null;
  show_popup?: boolean | null;
  is_active?: boolean | null;
  start_at?: string | null;
  end_at?: string | null;
  priority?: number | null;
  created_at?: string | null;
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  author_name?: string | null;
  status?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  faq_items?: BlogFaqItem[] | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
