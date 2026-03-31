// Returns the correct image URL for a user's profile picture or icon
export function getProfileImageUrl(profilePicture, profileIcon) {
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
  if (profileIcon && profileIcon !== "default") {
    return profileIcon.startsWith("http") ? profileIcon : `${base}/${profileIcon.replace(/^\\/, "")}`;
  }
  if (profilePicture) {
    return profilePicture.startsWith("http") ? profilePicture : `${base}/${profilePicture.replace(/^\\/, "")}`;
  }
  return null;
}
