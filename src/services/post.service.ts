import { CreatePostInput, UpdatePostInput } from "validators/post.validator";
import { postRepository } from "../database/repositories/post.repository";
import { UploadedFile } from "middleware/file-upload.middleware";

export const postService = {
  // service to create a post
  async createPost(
    postData: CreatePostInput["body"],
    userId: string,
    uploadedFiles: UploadedFile[]
  ) {
    const { title, issue_description, solution_description } = postData;

    const postFilesUrl = uploadedFiles.map((file) => file.url);
    return await postRepository.createPost({
      userId,
      title,
      issue_description,
      solution_description,
      postFilesUrl,
    });
  },

  // service to update a post
  async updatePost(
    postId: string,
    updateData: UpdatePostInput["body"],
    userId: string,
    uploadedFiles: UploadedFile[]
  ) {
    const existingPost = await postRepository.getPostById(postId);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.user_id !== userId) {
      throw new Error("Unauthorized: You cannot update this post");
    }
    const mode = updateData.mode;

    let finalFileUrls;

    if (mode === "append") {
      finalFileUrls = uploadedFiles.length
        ? [...existingPost.postfileurl, ...uploadedFiles.map((f) => f.url)]
        : existingPost.postfileurl;
    }

    if (mode === "replace") {
      finalFileUrls = uploadedFiles.length
        ? uploadedFiles.map((f) => f.url)
        : existingPost.postfileurl;
    }
    const updatedData = {
      title: updateData.title ?? existingPost.title,
      issue_description:
        updateData.issue_description ?? existingPost.issue_description,
      solution_description:
        updateData.solution_description ?? existingPost.solution_description,
      postFilesUrl: finalFileUrls,
    };

    const updatedPost = await postRepository.updatePost(postId, updatedData);

    return updatedPost;
  },

  // service to delete a post
  async deletePost(postId: string, userId: string) {
    const existingPost = await postRepository.getPostById(postId);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.user_id !== userId) {
      throw new Error("Unauthorized: You cannot update this post");
    }

    const deletePost = await postRepository.deletePost(postId);
    return deletePost;
  },

  async allPosts() {
    const users = await postRepository.getAllPosts();
    return users;
  },

  async getPostById(post_id: string) {
    return await postRepository.getPostById(post_id);
  },
};
