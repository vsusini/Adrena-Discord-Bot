import { Client, ClientOptions, GatewayIntentBits, Events } from "discord.js";
import { setupCommands } from "./commands";
import { StatusManager } from "./services/statusManager";
import { RewardsManager } from "./services/rewardsManager";
import { PositionTracker } from "./services/positionTracker";

export class DiscordBot {
  private client: Client;
  private statusManager!: StatusManager;
  private rewardsManager!: RewardsManager;

  constructor() {
    const options: ClientOptions = {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
      ],
    };

    this.client = new Client(options);
    this.initializeEventHandlers();
  }

  private initializeEventHandlers(): void {
    // Handle ready event
    this.client.once(Events.ClientReady, async (client) => {
      try {
        console.log(`Logged in as ${client.user.tag}`);

        // Initialize trackers and managers
        console.log("Initializing services...");
        PositionTracker.getInstance(client);
        this.statusManager = new StatusManager(this.client);
        this.rewardsManager = new RewardsManager(this.client);

        // Setup commands
        await setupCommands(this.client);
        console.log("Commands have been set up successfully");

        // Start update loops
        this.statusManager.startStatusLoop();
        this.rewardsManager.startRewardsLoop();
        console.log("Services started successfully");
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    });

    // Handle errors
    this.client.on(Events.Error, (error) => {
      console.error("Discord client error:", error);
    });
  }

  public async start(token: string): Promise<void> {
    if (!token) {
      throw new Error("No token provided");
    }

    console.log("Starting bot...");
    try {
      await this.client.login(token);
      console.log("Login successful, waiting for ready event...");
    } catch (error) {
      console.error("Failed to log in:", error);
      throw error;
    }
  }
}
