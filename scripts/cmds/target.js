module.exports = {
  config: {
    name: "target",
    version: "1.1",
    author: "ChatGPT",
    role: 2,
    description: "Auto reply to specific UID users",
    category: "fun",
    guide: {
      en: "{pn} <uid> | <reply>\n{pn} remove <uid>\n{pn} list"
    }
  },

  onStart: async function ({ message, event, args, threadsData }) {
    const { threadID } = event;
    let targets = await threadsData.get(threadID, "data.targetUsers", {}) || {};

    if (args[0] === "list") {
      if (Object.keys(targets).length === 0) return message.reply("📭 No targets set.");
      const list = Object.entries(targets)
        .map(([uid, d], i) => `${i + 1}. UID: ${uid} | Reply: ${d.reply}`)
        .join("\n");
      return message.reply("🎯 Target List:\n" + list);
    }

    if (args[0] === "remove") {
      const uid = args[1];
      if (!targets[uid]) return message.reply("❌ UID not found.");
      delete targets[uid];
      await threadsData.set(threadID, targets, "data.targetUsers");
      return message.reply(`✅ Removed target UID: ${uid}`);
    }

    const input = args.join(" ").split("|").map(s => s.trim());
    if (input.length < 2) return message.reply("❌ Use: /target <uid> | <reply>");
    const [uid, reply] = input;
    if (isNaN(uid)) return message.reply("❌ UID must be a number.");

    targets[uid] = {
      reply,
      lastReplied: 0
    };

    await threadsData.set(threadID, targets, "data.targetUsers");
    return message.reply(`✅ Target set for UID: ${uid}\n💬 Reply: ${reply}`);
  }
};
