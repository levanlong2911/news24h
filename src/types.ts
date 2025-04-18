// src/types.ts
export interface Category {
    id: number;
    name: string;
  }

  export interface Admin {
    name: string;
  }

  export interface Post {
    id: number;
    title: string;
    slug: string;
    description?: string;
    content: string;
    thumbnail?: string;
    image?: string;
    category?: Category;
    admin?: Admin;
    created_at: string;
    updated_at: string;
  }