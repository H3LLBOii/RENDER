const { getCurrentUserID } = require("fb-chat-api");

let pingIntervals = {};

module.exports = {
  config: {
    name: "autoping",
    version: "1.0",
    author: "OpenAI",
    role: 1,
    description: {
      en: "Auto ping a user every X minutes with a message"
    },
    category: "auto",
    guide: {
      en: "{pn} @user <minutes> <message> | {pn} off"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { mentions, threadID, senderID } = event;

    if (args[0]?.toLowerCase() === "off") {
      if (pingIntervals[threadID]) {
        clearInterval(pingIntervals[threadID]);
        delete pingIntervals[threadID];
        return message.reply("⛔ Auto-ping stopped.");
      } else {
        return message.reply("⚠️ No active auto-ping found.");
      }
    }

    if (Object.keys(mentions).length === 0 || args.length < 3) {
      return message.reply("⚠️ Usage: autoping @user <minutes> <message>");
    }

    let targetUID = Object.keys(mentions)[0];
    let intervalMin = parseInt(args[1]);

    if (isNaN(intervalMin) || intervalMin < 1) {
      return message.reply("⏱ Please provide a valid interval (in minutes).");
    }

    let pingMessage = args.slice(2).join(" ");

    pingIntervals[threadID] = setInterval(() => {
      message.send({
        body: `${pingMessage}`,
        mentions: [{ tag: mentions[targetUID], id: targetUID }]
      });
    }, intervalMin * 60 * 1000);

    return message.reply(`✅ Auto-ping started for ${mentions[targetUID]} every ${intervalMin} minutes.`);
  }
};
