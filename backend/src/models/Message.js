import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({ from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, content: String }, { timestamps: true });
export const Message = mongoose.model("Message", messageSchema);
