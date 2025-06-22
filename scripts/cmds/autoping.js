let pingIntervals = {};

module.exports = {
  config: {
    name: "autoping",
    version: "1.0",
    author: "ChatGPT",
    role: 1, // Admin only
    description: {
      en: "Auto ping a user every X minutes with a message"
    },
    category: "auto",
    guide: {
      en: "{pn} @user <minutes> <message>\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args }) {
    const { threadID, mentions } = event;

    // Turn off existing ping
    if (args[0]?.toLowerCase() === "off") {
      if (pingIntervals[threadID]) {
        clearInterval(pingIntervals[threadID]);
        delete pingIntervals[threadID];
        return message.reply("⛔ Auto-ping stopped.");
      } else {
        return message.reply("⚠️ No active auto-ping is running.");
      }
    }

    // Must mention someone
    if (Object.keys(mentions).length === 0) {
      return message.reply("⚠️ Please mention a user to auto-ping.");
    }

    // Validate minutes
    const minutes = parseInt(args[1]);
    if (isNaN(minutes) || minutes < 1) {
      return message.reply("⏱ Please provide a valid number of minutes (e.g., 1, 5, 10).");
    }

    // Message content
    const userId = Object.keys(mentions)[0];
    const tagName = mentions[userId];
    const customMessage = args.slice(2).join(" ");

    if (!customMessage) {
      return message.reply("💬 Please provide a message to send.");
    }

    // Set the interval
    pingIntervals[threadID] = setInterval(() => {
      message.send({
        body: `${customMessage}`,
        mentions: [{ id: userId, tag: tagName }]
      });
    }, minutes * 60 * 1000); // convert minutes to ms

    return message.reply(`✅ Auto-pinging ${tagName} every ${minutes} minute(s).`);
  }
};
