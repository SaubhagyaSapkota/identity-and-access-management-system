import { CreatePostInput } from "validators/post.validator";
import { postRepository } from "../database/repositories/post.repository";
import { UploadedFile } from "middleware/file-upload.middleware";

export const postService = {
  // service to create a post
  async createPost(postData: CreatePostInput["body"], userId: string, uploadedFiles: UploadedFile[]) {
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
};
