import z from "zod";

export const createPostValidator = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    issue_description: z.string().min(1, "Content is required"),
    solution_description: z.string().min(1, "Content is required"),
  }),
});

export const updatePostValidator = z.object({
  params: z.object({
    postId: z.string().min(1, "Post ID is required"),
  }),
  body: z.object({
    mode: z.enum(["append", "replace"]).default("replace"),
    title: z.string().min(1, "Title is required").optional(),
    issue_description: z.string().min(1, "Content is required").optional(),
    solution_description: z.string().min(1, "Content is required").optional(),
  }),
});

export const deletePostValidator = z.object({
  params: z.object({
    postId: z.string().min(1, "Post ID is required"),
  }),
});

export const getPostByIdValidator = z.object({
  params: z.object({
    postId: z.string().min(1, "Post ID is required"),
  }),
});

export type CreatePostInput = z.infer<typeof createPostValidator>;
export type UpdatePostInput = z.infer<typeof updatePostValidator>;
export type DeletePostInput = z.infer<typeof deletePostValidator>;
export type GetPostByIdInput = z.infer<typeof getPostByIdValidator>;
