module.exports = {
  config: {
    name: "target",
    version: "2.1",
    author: "ChatGPT",
    countDown: 5,
    role: 1,
    description: {
      en: "Auto reply to a specific UID"
    },
    category: "fun",
    guide: {
      en: "{pn} <uid> | <reply>\n{pn} remove <uid>\n{pn} list"
    }
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const { threadID } = event;
    const subCommand = args[0];

    let targetUsers = await threadsData.get(threadID, "data.targetUsers", {});

    if (subCommand === "list") {
      if (Object.keys(targetUsers).length === 0)
        return message.reply("📭 No targets set.");
      const list = Object.entries(targetUsers)
        .map(([uid, data], i) => `${i + 1}. UID: ${uid} | Reply: ${data.reply}`)
        .join("\n");
      return message.reply(`🎯 Current targets:\n${list}`);
    }

    if (subCommand === "remove") {
      const uid = args[1];
      if (!uid || !targetUsers[uid])
        return message.reply("❌ UID not found.");
      delete targetUsers[uid];
      await threadsData.set(threadID, targetUsers, "data.targetUsers");
      return message.reply(`✅ Removed target UID: ${uid}`);
    }

    const input = args.join(" ").split("|").map(e => e.trim());
    if (input.length < 2)
      return message.reply("❌ Use format:\n/target <uid> | <reply>");

    const [uid, reply] = input;
    if (isNaN(uid)) return message.reply("❌ UID must be numeric.");

    targetUsers[uid] = { reply, lastReplied: 0 };
    await threadsData.set(threadID, targetUsers, "data.targetUsers");

    return message.reply(`✅ Set target for UID: ${uid}\n🗨️ Message: ${reply}`);
  },

  onMessage: async function ({ event, message, api, threadsData, usersData }) {
    const { senderID, threadID } = event;

    const targetUsers = await threadsData.get(threadID, "data.targetUsers", {});
    const userTarget = targetUsers[senderID];
    if (!userTarget) return;

    const now = Date.now();
    const cooldown = 3000;

    if (now - (userTarget.lastReplied || 0) < cooldown) return;

    userTarget.lastReplied = now;
    await threadsData.set(threadID, targetUsers, "data.targetUsers");

    const userInfo = await usersData.get(senderID);
    const threadInfo = await api.getThreadInfo(threadID);

    const finalMessage = userTarget.reply
      .replace(/{userName}/g, userInfo?.name || "User")
      .replace(/{userNameTag}/g, `@${userInfo?.name || "User"}`)
      .replace(/{boxName}/g, threadInfo?.threadName || "this group");

    console.log(`[REPLYING] To ${senderID} with: ${finalMessage}`);
    return message.reply(finalMessage);
  }
};
