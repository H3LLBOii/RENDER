module.exports = {
  config: {
    name: "targetAbuse",
    version: "1.0",
    author: "ChatGPT",
    description: "Auto abuse specific UID in group",
    category: "events"
  },

  // 👇 Replace with your target UID
  targetUID: "61573965297895",

  run: async function ({ event, api }) {
    const { senderID, threadID, isGroup } = event;

    // Only in group chat
    if (!isGroup) return;

    // If the target user sends a message
    if (senderID === this.targetUID) {
      return api.sendMessage("bhadwe", threadID);
    }
  }
};
