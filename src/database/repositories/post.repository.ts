import { pool } from "../connections/postgres.connection";

export const postRepository = {
  // Create a new post
  async createPost({
    userId,
    title,
    postFilesUrl,
    issue_description,
    solution_description,
  }: {
    userId: string;
    title: string;
    postFilesUrl: string[];
    issue_description: string;
    solution_description: string;
  }) {
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, postfileUrl, issue_description, solution_description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        title,
        postFilesUrl,
        issue_description || null,
        solution_description || null,
      ]
    );
    return result.rows[0];
  },
};
