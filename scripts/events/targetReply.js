module.exports = {
  config: {
    name: "targetReply",
    eventType: ["message"],
    category: "auto"
  },

  onStart: async function () {},

  onEvent: async function ({ event, threadsData, message, usersData }) {
    const { threadID, senderID } = event;
    const targets = await threadsData.get(threadID, "data.targetUsers", {});
    const userTarget = targets?.[senderID];

    if (!userTarget) return;

    const now = Date.now();
    const cooldown = 3000;

    if (now - (userTarget.lastReplied || 0) < cooldown) return;

    userTarget.lastReplied = now;
    await threadsData.set(threadID, targets, "data.targetUsers");

    const userName = await usersData.getName(senderID);
    const boxName = await threadsData.get(threadID, "threadInfo.threadName");

    const replyMsg = userTarget.reply
      .replace(/{userName}/g, userName)
      .replace(/{boxName}/g, boxName || "this group");

    message.reply(replyMsg);
  }
};
