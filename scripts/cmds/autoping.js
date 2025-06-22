let pingIntervals = {};

module.exports = {
  config: {
    name: "autoping",
    version: "1.1",
    author: "ChatGPT",
    role: 1,
    description: {
      en: "Auto ping a user every X seconds with a message"
    },
    category: "auto",
    guide: {
      en: "{pn} @user <seconds> <message>\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args }) {
    const { threadID, mentions } = event;

    // Stop current ping
    if (args[0]?.toLowerCase() === "off") {
      if (pingIntervals[threadID]) {
        clearInterval(pingIntervals[threadID]);
        delete pingIntervals[threadID];
        return message.reply("⛔ Auto-ping stopped.");
      } else {
        return message.reply("⚠️ No active auto-ping running.");
      }
    }

    // Require @mention
    if (Object.keys(mentions).length === 0) {
      return message.reply("⚠️ Please mention a user to auto-ping.");
    }

    const seconds = parseInt(args[1]);
    if (isNaN(seconds) || seconds < 1) {
      return message.reply("⏱ Please provide a valid number of **seconds** (e.g., 5, 10, 30).");
    }

    const userId = Object.keys(mentions)[0];
    const tagName = mentions[userId];
    const customMessage = args.slice(2).join(" ");

    if (!customMessage) {
      return message.reply("💬 Please provide a message to send.");
    }

    pingIntervals[threadID] = setInterval(() => {
      message.send({
        body: `${customMessage}`,
        mentions: [{ id: userId, tag: tagName }]
      });
    }, seconds * 1000); // seconds to milliseconds

    return message.reply(`✅ Auto-pinging ${tagName} every ${seconds} second(s).`);
  }
};
