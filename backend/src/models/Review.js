import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  reviews: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: String,
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
      submittedAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Calculate average rating before saving
reviewSchema.pre("save", function(next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = (sum / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
  next();
});

export const Review = mongoose.model("Review", reviewSchema);
