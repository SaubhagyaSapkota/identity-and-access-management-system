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

  async getPostById(postId: string) {
    const result = await pool.query(`SELECT * FROM posts WHERE post_id = $1`, [
      postId,
    ]);
    return result.rows[0];
  },

  async updatePost(
    postId: string,
    {
      title,
      issue_description,
      solution_description,
      postFilesUrl,
    }: {
      title: string;
      issue_description: string;
      solution_description: string;
      postFilesUrl: string[];
    }
  ) {
    const result = await pool.query(
      `UPDATE posts
     SET title = $1,
         issue_description = $2,
         solution_description = $3,
         postfileurl = $4,
         updated_at = NOW()
     WHERE post_id = $5
     RETURNING *`,
      [title, issue_description, solution_description, postFilesUrl, postId]
    );

    return result.rows[0];
  },

  async deletePost(postId: string) {
    const result = await pool.query(
      `DELETE FROM posts WHERE post_id = $1 RETURNING *`,
      [postId]
    );

    return result.rows[0];
  },
};
