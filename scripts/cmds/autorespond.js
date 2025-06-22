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
    version: "1.1",
    author: "OpenAI",
    role: 1,
    description: {
      en: "Set auto replies for specific words"
    },
    category: "automation",
    guide: {
      en: "{pn} set trigger: response\n{pn} delete trigger\n{pn} list"
    }
  },

  onStart: async function ({ args, message, event }) {
    const { threadID } = event;

    if (!responseData[threadID]) responseData[threadID] = {};

    const subcmd = args[0];

    if (subcmd === "set") {
      const input = args.slice(1).join(" ");
      const match = input.split(/[:=>]/); // now supports ":" and "=>"

      if (match.length < 2) {
        return message.reply("⚠️ Format: set trigger: response");
      }

      const trigger = match[0].trim().toLowerCase();
      const response = match.slice(1).join(":").trim(); // in case response has ":" in it

      if (!trigger || !response) {
        return message.reply("❌ Invalid trigger or response.");
      }

      responseData[threadID][trigger] = response;
      saveData();
      return message.reply(`✅ Rule set: "${trigger}" → "${response}"`);
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

    return message.reply("📚 Use:\n- set trigger: response\n- delete trigger\n- list");
  },

  onChat: async function ({ message, event }) {
    const { threadID, body } = event;

    if (!responseData[threadID]) return;

    const text = body.toLowerCase();
    const triggers = Object.keys(responseData[threadID]);

    for (let trigger of triggers) {
      if (text.includes(trigger)) {
        return message.reply(responseData[threadID][trigger]);
      }
    }
  }
};
