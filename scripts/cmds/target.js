module.exports = {
  config: {
    name: "target",
    version: "2.1",
    author: "ChatGPT",
    countDown: 5,
    role: 1,
    description: {
      en: "Auto-reply to specific UIDs with custom replies (supports placeholders)"
    },
    category: "fun",
    guide: {
      en: "{pn} <uid> | <reply>: set target\n{pn} remove <uid>: remove target\n{pn} list: list all targets"
    }
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const { threadID } = event;
    const subCommand = args[0];

    let targetUsers = await threadsData.get(threadID, "data.targetUsers", {});

    if (subCommand === "list") {
      if (Object.keys(targetUsers).length === 0)
        return message.reply("📭 No targets set.");
      let list = Object.entries(targetUsers)
        .map(([uid, data], i) => `${i + 1}. UID: ${uid} | Reply: ${data.reply}`)
        .join("\n");
      return message.reply(`🎯 Current targets:\n${list}`);
    }

    if (subCommand === "remove") {
      const uidToRemove = args[1];
      if (!targetUsers[uidToRemove])
        return message.reply("❌ UID not found in target list.");
      delete targetUsers[uidToRemove];
      await threadsData.set(threadID, targetUsers, "data.targetUsers");
      return message.reply(`✅ Removed target UID: ${uidToRemove}`);
    }

    const rawInput = args.join(" ").split("|").map(s => s.trim());
    if (rawInput.length < 2)
      return message.reply("❌ Invalid format. Use:\n/target <uid> | <reply>");

    const uid = rawInput[0];
    const reply = rawInput[1];

    if (isNaN(uid)) return message.reply("❌ UID must be a number.");

    targetUsers[uid] = {
      reply,
      lastReplied: 0
    };

    await threadsData.set(threadID, targetUsers, "data.targetUsers");
    return message.reply(`✅ Target set for UID ${uid}.\n🗨️ Reply: "${reply}"`);
  },

  onChat: async function ({ message, event, threadsData, usersData, api }) {
    const { senderID, threadID } = event;
    const targetUsers = await threadsData.get(threadID, "data.targetUsers", {});
    const user = targetUsers[senderID];
    if (!user) return;

    const now = Date.now();
    const cooldown = 3000; // 3 seconds

    if (now - (user.lastReplied || 0) < cooldown) return;

    user.lastReplied = now;
    await threadsData.set(threadID, targetUsers, "data.targetUsers");

    const userInfo = await usersData.get(senderID);
    const threadInfo = await api.getThreadInfo(threadID);

    const finalReply = user.reply
      .replace(/{userName}/g, userInfo.name || "User")
      .replace(/{userNameTag}/g, `@${userInfo.name}`)
      .replace(/{boxName}/g, threadInfo.threadName || "Group");

    return message.reply(finalReply);
  }
};
