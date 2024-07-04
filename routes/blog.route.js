import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  getBlogsCount,
  trendingBlogs,
  searchBlogs,
  getBlog,
  likeBlog,
  isLikedByUser,
  addComment,
  getComments,
  deleteComment,
  userBlogs,
  userBlogsCount
} from "../controllers/blog.controller.js";
import verifyUser from "../middleware/verify.middleware.js";

const router = Router();

router.post("/create-blog", verifyUser, createBlog);
router.post("/latest-blogs", getBlogs);
router.get("/trending-blogs", trendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/blog-count", getBlogsCount);
router.post("/get-blog", getBlog);
router.post("/like-blog", verifyUser,likeBlog)
router.post("/is-liked-by-user", verifyUser, isLikedByUser)
router.post("/add-comment", verifyUser, addComment)
router.post("/get-comments", getComments)
router.post("/delete-comment", verifyUser, deleteComment)
router.post("/user-blogs", verifyUser, userBlogs)
router.post("/user-blogs-count", verifyUser, userBlogsCount)
router.post("/delete-blog", verifyUser, deleteBlog);

export default router;
