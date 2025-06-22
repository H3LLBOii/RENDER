const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "target",
    version: "1.0",
    author: "Aryan+ChatGPT",
    role: 2,
    description: "Set welcome message for specific user",
    category: "custom"
  },

  onStart: async function ({ args, message, event, usersData, threadsData }) {
    const filePath = path.join(__dirname, "cache", "target.json");
    fs.ensureFileSync(filePath);

    const targets = fs.readJsonSync(filePath, { throws: false }) || {};

    if (args.length < 2 || args[1] !== "|")
      return message.reply("❌ Usage: .target <uid> | <message>");

    const targetID = args[0].toString();
    const msg = args.slice(2).join(" ");

    targets[targetID] = {
      reply: msg,
      addedBy: event.senderID,
      lastReplied: 0
    };

    fs.writeJsonSync(filePath, targets, { spaces: 2 });

    const user = await usersData.get(targetID);
    const name = user?.name || "User";

    message.reply(`✅ Target message set for ${name} (${targetID}):\n\n"${msg}"`);
  }
};
