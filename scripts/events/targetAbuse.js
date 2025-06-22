module.exports = {
  config: {
    name: "targetAbuse",
    version: "1.0",
    author: "ChatGPT",
    description: "Reply to a specific UID when they message in group",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    const { senderID, threadID, isGroup } = event;

    // ✅ Replace with your target UID
    const targetUID = "61573965297895";

    // ✅ Reply only when message is from target in group chat
    if (isGroup && senderID === targetUID) {
      return api.sendMessage("bhadwe", threadID);
    }
  }
};
