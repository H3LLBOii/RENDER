const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "targetReply",
    version: "1.0",
    author: "Aryan+ChatGPT",
    description: "Auto reply when target sends a message",
    category: "events"
  },

  onMessage: async function ({ event, message, usersData, threadsData }) {
    const { senderID, threadID } = event;
    const filePath = path.join(__dirname, "..", "commands", "cache", "target.json");

    const targets = fs.readJsonSync(filePath, { throws: false }) || {};
    const userTarget = targets?.[senderID.toString()];
    if (!userTarget) return;

    const cooldown = 3000; // 3 seconds
    const now = Date.now();
    if (now - (userTarget.lastReplied || 0) < cooldown) return;

    // Replace placeholders
    const user = await usersData.get(senderID);
    const thread = await threadsData.get(threadID);
    const boxName = thread.threadName || "this group";
    const userName = user.name || "user";

    const replyMsg = userTarget.reply
      .replace(/{userName}/g, userName)
      .replace(/{boxName}/g, boxName);

    message.reply(replyMsg);

    // Update timestamp
    userTarget.lastReplied = now;
    fs.writeJsonSync(filePath, targets, { spaces: 2 });
  }
};
