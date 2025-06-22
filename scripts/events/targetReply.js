module.exports = {
  config: {
    name: "targetReply",
    version: "1.0",
    author: "ChatGPT",
    description: "Send message to a specific user in group with placeholders",
    category: "events"
  },

  onStart: async function ({ event, api, threadsData, usersData }) {
    try {
      const { body, threadID, senderID } = event;

      if (!body || !body.startsWith(".target")) return;

      const args = body.split(" ");
      const targetID = args[1];
      const splitIndex = body.indexOf("|");
      if (splitIndex === -1) return;

      const messageText = body.slice(splitIndex + 1).trim();
      if (!targetID || !messageText) return;

      const userData = await usersData.get(targetID);
      const threadData = await threadsData.get(threadID);

      const placeholders = {
        "{userName}": userData?.name || "User",
        "{userNameTag}": `@${userData?.name || "user"}`,
        "{boxName}": threadData?.threadInfo?.threadName || "this group",
        "{multiple}": threadData?.participantIDs.length > 2 ? "you all" : "you",
        "{session}": getSession()
      };

      let finalMessage = messageText;
      for (const key in placeholders) {
        finalMessage = finalMessage.replace(new RegExp(key, "g"), placeholders[key]);
      }

      api.sendMessage(finalMessage, threadID, undefined, undefined, true);
    } catch (err) {
      console.error("targetReply Error:", err);
    }
  }
};

// Optional: Time-based greeting
function getSession() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
