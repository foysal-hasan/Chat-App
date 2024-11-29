import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { createServer } from "http";

import connectDB from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import chatRouter from "./routes/chatRouter.js";
import messageRouter from "./routes/messageRouter.js";
import uploadRouter from "./routes/uploadRouter.js";
import notFound from "./middlewares/not-found.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";
import { initializeSocketIO } from "./socket/index.js";
import { upload } from "./middlewares/multerMiddleware.js";

// config
dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
// extra middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const __dirname = path.resolve();
// console.log(path.join(__dirname, "backend/uploads"));
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.post("/", upload.array("attachments", 5), (req, res, next) => {
  console.log(req.body.content);
  console.log(req.files);

  res.send("content");
});
// routers
app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/upload", uploadRouter);

app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
);

// if (process.env.NODE_ENV === "production") {
//   const __dirname = path.resolve();
//   app.use("/uploads", express.static("/var/data/uploads"));
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
//   );
// } else {
//   const __dirname = path.resolve();
//   app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
//   app.get("/", (req, res) => {
//     res.send("API is running....");
//   });
// }
initializeSocketIO(io);

// error handlers
app.use(notFound);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, console.log(`Listening on port ${PORT}`));
