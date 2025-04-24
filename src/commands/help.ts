import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fs from "fs/promises";
import path from "path";
import { CONSTANTS } from "../utils/constants";

export const command = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Display bot commands and usage information");

export async function handleHelpCommand(
  interaction: ChatInputCommandInteraction
) {
  const readmePath = path.resolve(__dirname, "../../README.md");

  try {
    const content = await fs.readFile(readmePath, "utf-8");

    const commandsSection = extractMarkdownSection(
      content,
      "Commands",
      "Prerequisites"
    );

    const embed = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("📖 Adrena Bot Help")
      .setDescription("Here’s a quick guide to the available commands.")
      .addFields({
        name: "💻 Commands",
        value: formatMarkdown(commandsSection),
      })
      .setFooter({ text: "Built with 💉 for the Adrena community" });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error("Failed to load README:", err);
    await interaction.reply({
      content: "Sorry, something went wrong loading the help menu.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

// Extracts the section between two headings
function extractMarkdownSection(
  content: string,
  startHeader: string,
  endHeader?: string
): string {
  const startRegex = new RegExp(`## ${startHeader}`, "i");
  const endRegex = endHeader ? new RegExp(`## ${endHeader}`, "i") : null;

  const startIdx = content.search(startRegex);
  if (startIdx === -1) return "";

  const endIdx = endRegex ? content.slice(startIdx + 1).search(endRegex) : -1;
  return content.slice(startIdx, endIdx === -1 ? undefined : startIdx + endIdx);
}

// Format Markdown to inline Discord-safe plaintext (basic)
function formatMarkdown(md: string): string {
  return md
    .replace("## Commands", "") // removes the "## Commands" heading
    .replace(/^\s*\n/gm, "") // removes empty lines
    .trim()
    .slice(0, 1024); // Discord embed field limit
}
