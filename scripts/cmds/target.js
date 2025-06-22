module.exports = {
	config: {
		name: "target",
		version: "2.2",
		author: "ChatGPT",
		countDown: 5,
		role: 2, // Only bot admins
		description: {
			en: "Auto-reply to target UID messages with custom replies"
		},
		category: "fun",
		guide: {
			en: "{pn} <uid> | <reply>: set target\n{pn} remove <uid>: remove target\n{pn} list: show all targets"
		}
	},

	onStart: async function ({ message, event, args, threadsData }) {
		const { threadID } = event;
		let targetUsers = await threadsData.get(threadID, "data.targetUsers", {});

		if (args[0] === "list") {
			if (Object.keys(targetUsers).length === 0)
				return message.reply("📭 No target UIDs set.");
			let msg = "🎯 Target List:\n";
			for (const [uid, data] of Object.entries(targetUsers)) {
				msg += `• UID: ${uid} | Reply: "${data.reply}"\n`;
			}
			return message.reply(msg.trim());
		}

		if (args[0] === "remove") {
			const uidToRemove = args[1];
			if (!uidToRemove || !targetUsers[uidToRemove])
				return message.reply("❌ UID not found in list.");
			delete targetUsers[uidToRemove];
			await threadsData.set(threadID, targetUsers, "data.targetUsers");
			return message.reply(`✅ Removed UID ${uidToRemove} from target list.`);
		}

		const input = args.join(" ").split("|").map(s => s.trim());
		if (input.length < 2) return message.reply("❌ Invalid format.\nUse: /target <uid> | <reply>");

		const uid = input[0];
		const reply = input.slice(1).join("|");

		if (isNaN(uid)) return message.reply("❌ UID must be a number.");

		targetUsers[uid] = {
			reply,
			lastReplied: 0
		};

		await threadsData.set(threadID, targetUsers, "data.targetUsers");
		return message.reply(`✅ Set target for UID: ${uid}\n🗨️ Reply: "${reply}"`);
	},

	onChat: async function ({ message, event, threadsData }) {
		const { senderID, threadID } = event;
		const targetUsers = await threadsData.get(threadID, "data.targetUsers", {});
		const user = targetUsers[senderID];

		if (!user) return;

		const now = Date.now();
		const cooldown = 3 * 1000; // ✅ 3 seconds cooldown

		if (now - (user.lastReplied || 0) < cooldown) return;

		user.lastReplied = now;
		await threadsData.set(threadID, targetUsers, "data.targetUsers");

		return message.reply(user.reply);
	}
};
