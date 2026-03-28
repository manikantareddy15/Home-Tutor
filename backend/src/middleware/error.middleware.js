export const notFound = (req,res) => {
  console.log("404 - Route not found:", req.originalUrl);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err,req,res,next) => {
  console.error("Error handler caught:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
};
