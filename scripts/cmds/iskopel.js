const fs = require("fs");

let loopInterval = {};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  config: {
    name: "iskopel",
    version: "2.1",
    author: "YourName",
    countDown: 5,
    role: 2,
    description: {
      vi: "Gửi tin nhắn từ np.txt mỗi X giây, có thể thêm prefix và shuffle",
      en: "Loop messages from np.txt every X seconds, with optional prefix and shuffle"
    },
    category: "auto",
    guide: {
      vi: "{pn} [giây] [shuffle] [prefix]\n{pn} off\n{pn} status",
      en: "{pn} [seconds] [shuffle] [prefix]\n{pn} off\n{pn} status"
    }
  },

  onStart: async function ({ message, event, args }) {
    const { threadID } = event;

    // Turn off loop
    if (args[0]?.toLowerCase() === "off") {
      if (loopInterval[threadID]) {
        clearInterval(loopInterval[threadID]);
        delete loopInterval[threadID];
        return message.reply("⛔ Auto message loop turned OFF.");
      } else {
        return message.reply("⚠️ No active loop to stop.");
      }
    }

    // Check status
    if (args[0]?.toLowerCase() === "status") {
      return message.reply(loopInterval[threadID]
        ? "✅ Auto messaging is ACTIVE."
        : "❌ Auto messaging is OFF.");
    }

    // Default interval
    let interval = 15;
    let isShuffle = false;
    let prefix = "";

    // Parse args
    for (let arg of args) {
      if (!isNaN(arg)) interval = parseInt(arg);
      else if (arg.toLowerCase() === "shuffle") isShuffle = true;
      else prefix = arg + " "; // Add space after prefix word
    }

    // Load file
    let filePath = __dirname + "/np.txt";
    if (!fs.existsSync(filePath))
      return message.reply("❌ File np.txt not found.");

    let content = fs.readFileSync(filePath, "utf-8").split("\n").filter(line => line.trim() !== "");

    if (content.length === 0)
      return message.reply("❌ np.txt file is empty or invalid.");

    if (isShuffle) content = shuffleArray(content);

    let index = 0;

    loopInterval[threadID] = setInterval(() => {
      message.send(`${prefix}${content[index]}`);
      index = (index + 1) % content.length;
    }, interval * 1000);

    return message.reply(`✅ Loop started!\n⏱ Interval: ${interval} sec\n🔀 Shuffle: ${isShuffle ? "ON" : "OFF"}\n🏷 Prefix: ${prefix || "None"}`);
  }
};
