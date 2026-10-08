// api.types.ts

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export type UserRole = "ADMIN" | "MODERATOR" | "USER";

export interface ApiError {
  error: string;
}

export interface AuthorSummary {
  id: number;
  username: string;
}

export interface AuthorWithEmail extends AuthorSummary {
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Profile {
  id: number;
  userId: number;
  bio: string | null;
  avatar: string | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
}


// ─────────────────────────────────────────────
// Post
// ─────────────────────────────────────────────

export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  views: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostList {
    data: Post[];
}

export interface PostWithAuthor extends Post {
  author: AuthorSummary;
}

export interface PostWithAuthorEmail extends Post {
  author: AuthorWithEmail;
}

export interface PostWithCategories extends Post {
  categories: Category[];
}

export interface PostWithAuthorAndCategories extends Post {
  author: AuthorSummary;
  categories: Category[];
}


// ─────────────────────────────────────────────
// Posts API
// ─────────────────────────────────────────────

export interface GetPostsResponse {
  data: PostWithAuthor[];
  meta: PaginationMeta;
}

export type GetPostResponse = PostWithAuthorEmail;

export type GetUserPostsResponse = Post[];

export type CreatePostResponse = PostWithAuthor;

export type UpdatePostResponse = Post;

export type PublishPostResponse = Post;

export type IncrementPostViewResponse = Post;

export type AddCategoriesResponse = PostWithCategories;

export type RemoveCategoryResponse = PostWithCategories;

export type DeletePostResponse = void;


// ─────────────────────────────────────────────
// Post requests
// ─────────────────────────────────────────────

export interface CreatePostRequest {
  title: string;
  content: string;
  authorId: number;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface AddCategoriesRequest {
  categoryNames: string[];
}

export interface RemoveCategoryRequest {
  categoryName: string;
}


// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  //createdAt: string;
  //updatedAt: string;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface UserWithProfileAndCounts
  extends UserWithProfile {
  _count: {
    posts: number;
  };
}

export interface UserWithPosts extends User {
  profile: Profile | null;
  posts: PostWithCategories[];
}


// ─────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────

export type GetUsersResponse =
  UserWithProfileAndCounts[];

export type GetUserResponse = UserWithPosts;

export type UpdateUserResponse = User;

export type GetProfileResponse = Profile | null;

export type UpdateProfileResponse = Profile;

export type DeleteUserResponse = void;


// ─────────────────────────────────────────────
// User requests
// ─────────────────────────────────────────────

export interface UpdateUserRequest {
  username: string;
  email: string;
  role: UserRole;
}

export interface UpdateProfileRequest {
  bio?: string;
  avatar?: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}
