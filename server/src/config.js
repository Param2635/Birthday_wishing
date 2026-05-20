export function getConfig() {
  return {
    port: process.env.PORT ? Number(process.env.PORT) : 5174,
    friendName: process.env.FRIEND_NAME || "My Friend",
    fromName: process.env.FROM_NAME || "Your Friend"
  };
}

