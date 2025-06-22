const cooldownMap = new Map();

module.exports = {
  config: {
    name: "target",
    aliases: [],
    version: "1.0",
    author: "ChatGPT",
    countDown: 5,
    role: 2,
    shortDescription: "Auto-reply to selected UID",
    longDescription: "Set custom replies for specific user IDs in group chats",
    category: "group",
    guide: {
      en: "{pn} <uid> | <reply>\n{pn} remove <uid>\n{pn} list"
    }
  },

  onStart: async function ({ args, threadsData, message, event }) {
    const { threadID } = event;
    let targetUsers = await threadsData.get(threadID, "data.targetUsers", {});

    const command = args[0];

    if (command === "list") {
      if (Object.keys(targetUsers).length === 0)
        return message.reply("📭 No targets set.");
      const list = Object.entries(targetUsers)
        .map(([uid, data], i) => `${i + 1}. UID: ${uid} → "${data.reply}"`)
        .join("\n");
      return message.reply("🎯 Current Targets:\n" + list);
    }

    if (command === "remove") {
      const uid = args[1];
      if (!targetUsers[uid]) return message.reply("❌ UID not found.");
      delete targetUsers[uid];
      await threadsData.set(threadID, targetUsers, "data.targetUsers");
      return message.reply(`✅ Removed target UID: ${uid}`);
    }

    const input = args.join(" ").split("|").map(i => i.trim());
    if (input.length < 2) return message.reply("❌ Use format:\n/target <uid> | <reply>");

    const uid = input[0];
    const reply = input.slice(1).join(" ");
    if (isNaN(uid)) return message.reply("❌ UID must be a number.");

    targetUsers[uid] = {
      reply,
      lastUsed: 0
    };

    await threadsData.set(threadID, targetUsers, "data.targetUsers");
    return message.reply(`✅ Target set for UID ${uid}.\n💬 Reply: "${reply}"`);
  },

  onChat: async function ({ event, threadsData, usersData, message }) {
    const { senderID, threadID } = event;

    if (!event.isGroup) return;

    const targetUsers = await threadsData.get(threadID, "data.targetUsers", {});
    if (!targetUsers[senderID]) return;

    const user = targetUsers[senderID];
    const now = Date.now();
    const lastUsed = cooldownMap.get(`${threadID}_${senderID}`) || 0;

    if (now - lastUsed < 3000) return; // 3s cooldown
    cooldownMap.set(`${threadID}_${senderID}`, now);

    const userData = await usersData.get(senderID);
    const threadData = await threadsData.get(threadID);
    const userName = userData.name || "User";
    const boxName = threadData.threadName || "this group";

    const formattedReply = user.reply
      .replace(/{userName}/g, userName)
      .replace(/{boxName}/g, boxName);

    return message.reply(formattedReply);
  }
};
