import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import UserRoutes from "./routes/user.route.js";
import BlogRoute from "./routes/blog.route.js";
import aws from "aws-sdk";
import { nanoid } from "nanoid";
import cors from "cors";
import ApiResponse from "./utils/ApiResponse.js";
const app = express();
let PORT = process.env.PORT || 3000;


app.use(express.json({ limit: "50mb", extended: true }));

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log(`Successfully connected to DB ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })

  .catch((err) =>
    console.error("Error occurred while connecting to DB: ", err)
  );

//setting up aws s3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_NAME,
  secretAccessKey: process.env.AWS_SECRET_KEY_NAME,
  region: process.env.AWS_REGION,
});

const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid(5)}-${date.getTime()}.jpeg`;
  return await s3.getSignedUrlPromise("putObject", {
    Bucket: 'blog-space-website',
    Key: imageName,
    ContentType: "image/jpeg", 
    Expires: 1000,
  });
};

//simple get request 
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/upload-url", async (req, res) => {
  const url = await generateUploadUrl();
  if (url) {
    res.status(200).json({upload_Url: url});
  }
  else {
    ApiResponse(res, 500, "Error occurred while generating upload URL");
  }
})
app.use("/api", UserRoutes);
app.use("/api",BlogRoute)


