const fs = require("fs");

const dbPath = __dirname + "/autorespond.json";

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "{}");

let responseData = JSON.parse(fs.readFileSync(dbPath));

function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(responseData, null, 2));
}

module.exports = {
  config: {
    name: "autorespond",
    version: "1.2",
    author: "OpenAI + Fix by ChatGPT",
    role: 1,
    description: {
      en: "Set auto replies for specific words for all users"
    },
    category: "automation",
    guide: {
      en: "{pn} set hello: hi there!\n{pn} delete hello\n{pn} list"
    }
  },

  onStart: async function ({ args, message, event }) {
    const { threadID } = event;

    if (!responseData[threadID]) responseData[threadID] = {};

    const subcmd = args[0]?.toLowerCase();

    if (subcmd === "set") {
      const input = args.slice(1).join(" ");
      const match = input.split(/[:=>]/); // supports ":" or "=>"

      if (match.length < 2) {
        return message.reply("⚠️ Format: set trigger: response");
      }

      const trigger = match[0].trim().toLowerCase();
      const response = match.slice(1).join(":").trim();

      if (!trigger || !response) {
        return message.reply("❌ Invalid trigger or response.");
      }

      responseData[threadID][trigger] = response;
      saveData();
      return message.reply(`✅ Rule set:\n"${trigger}" → "${response}"`);
    }

    if (subcmd === "delete") {
      const trigger = args.slice(1).join(" ").trim().toLowerCase();
      if (!responseData[threadID][trigger]) return message.reply("❌ Trigger not found.");
      delete responseData[threadID][trigger];
      saveData();
      return message.reply(`🗑 Deleted trigger "${trigger}"`);
    }

    if (subcmd === "list") {
      const list = Object.entries(responseData[threadID] || {})
        .map(([k, v]) => `🔹 ${k} → ${v}`)
        .join("\n");
      return message.reply(list || "📭 No auto-responses set.");
    }

    return message.reply("📚 Use:\n- set hello: hi there!\n- delete hello\n- list");
  },

  onChat: async function ({ message, event, api }) {
    const { threadID, senderID, body } = event;

    if (!body || !responseData[threadID]) return;

    // Don't reply to bot's own messages
    if (senderID === api.getCurrentUserID()) return;

    const text = body.toLowerCase();
    const triggers = Object.keys(responseData[threadID]);

    for (let trigger of triggers) {
      if (text.includes(trigger)) {
        return message.reply(responseData[threadID][trigger]);
      }
    }
  }
};
