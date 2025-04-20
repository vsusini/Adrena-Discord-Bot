import Database from "better-sqlite3";
import path from "path";

interface Position {
  positionId: number;
  wallet: string;
  symbol: string;
  side: string;
  entry_price: number;
  entry_leverage: number;
  lastStatus: string;
  userIds: Set<string>;
}

export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private db: Database.Database;

  private constructor() {
    const dbPath = path.join(process.cwd(), "data", "positions.db");
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeTables(): void {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS positions (
                position_id INTEGER PRIMARY KEY,
                wallet TEXT NOT NULL,
                symbol TEXT NOT NULL,
                side TEXT NOT NULL,
                entry_price REAL NOT NULL,
                entry_leverage REAL NOT NULL,
                last_status TEXT DEFAULT 'open'
            );

            CREATE TABLE IF NOT EXISTS user_positions (
                user_id TEXT NOT NULL,
                position_id INTEGER NOT NULL,
                FOREIGN KEY(position_id) REFERENCES positions(position_id) ON DELETE CASCADE,
                PRIMARY KEY(user_id, position_id)
            );
        `);
  }

  addPosition(position: {
    positionId: number;
    wallet: string;
    symbol: string;
    side: string;
    entry_price: number;
    entry_leverage: number;
    userId: string;
  }): boolean {
    const insertPosition = this.db.prepare(`
            INSERT OR IGNORE INTO positions 
            (position_id, wallet, symbol, side, entry_price, entry_leverage)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

    const insertUserPosition = this.db.prepare(`
            INSERT OR IGNORE INTO user_positions (user_id, position_id)
            VALUES (?, ?)
        `);

    const transaction = this.db.transaction(() => {
      insertPosition.run(
        position.positionId,
        position.wallet,
        position.symbol,
        position.side,
        position.entry_price,
        position.entry_leverage
      );
      insertUserPosition.run(position.userId, position.positionId);
    });

    try {
      transaction();
      return true;
    } catch (error) {
      console.error("Error adding position:", error);
      return false;
    }
  }

  getAllPositions(): Position[] {
    const stmt = this.db.prepare(`
            SELECT 
                p.*,
                GROUP_CONCAT(up.user_id) as user_ids
            FROM positions p
            LEFT JOIN user_positions up ON p.position_id = up.position_id
            GROUP BY p.position_id
        `);

    const positions = stmt.all() as Array<{
      position_id: number;
      wallet: string;
      symbol: string;
      side: string;
      entry_price: number;
      entry_leverage: number;
      last_status: string;
      user_ids: string | null;
    }>;
    return positions.map((row) => ({
      positionId: row.position_id,
      wallet: row.wallet,
      symbol: row.symbol,
      side: row.side,
      entry_price: row.entry_price,
      entry_leverage: row.entry_leverage,
      lastStatus: row.last_status,
      userIds: new Set(row.user_ids ? row.user_ids.split(",") : []),
    }));
  }

  removePosition(positionId: number): boolean {
    try {
      const stmt = this.db.prepare(
        "DELETE FROM positions WHERE position_id = ?"
      );
      const result = stmt.run(positionId);
      return result.changes > 0;
    } catch (error) {
      console.error("Error removing position:", error);
      return false;
    }
  }

  updatePositionStatus(positionId: number, status: string): boolean {
    try {
      const stmt = this.db.prepare(`
                UPDATE positions 
                SET last_status = ? 
                WHERE position_id = ?
            `);
      const result = stmt.run(status, positionId);
      return result.changes > 0;
    } catch (error) {
      console.error("Error updating position status:", error);
      return false;
    }
  }

  removeUserFromPosition(positionId: number, userId: string): boolean {
    try {
      const stmt = this.db.prepare(`
                DELETE FROM user_positions 
                WHERE position_id = ? AND user_id = ?
            `);
      const result = stmt.run(positionId, userId);

      // Check if this was the last user tracking this position
      const checkStmt = this.db.prepare(`
                SELECT COUNT(*) as count 
                FROM user_positions 
                WHERE position_id = ?
            `);
      const { count } = checkStmt.get(positionId) as { count: number };

      if (count === 0) {
        this.removePosition(positionId);
      }

      return result.changes > 0;
    } catch (error) {
      console.error("Error removing user from position:", error);
      return false;
    }
  }

  getUserPositions(userId: string): Position[] {
    const stmt = this.db.prepare(`
            SELECT 
                p.*,
                GROUP_CONCAT(up2.user_id) as user_ids
            FROM positions p
            JOIN user_positions up1 ON p.position_id = up1.position_id
            LEFT JOIN user_positions up2 ON p.position_id = up2.position_id
            WHERE up1.user_id = ?
            GROUP BY p.position_id
        `);

    const positions = stmt.all(userId) as Array<{
      position_id: number;
      wallet: string;
      symbol: string;
      side: string;
      entry_price: number;
      entry_leverage: number;
      last_status: string;
      user_ids: string | null;
    }>;
    return positions.map((row) => ({
      positionId: row.position_id,
      wallet: row.wallet,
      symbol: row.symbol,
      side: row.side,
      entry_price: row.entry_price,
      entry_leverage: row.entry_leverage,
      lastStatus: row.last_status,
      userIds: new Set(row.user_ids ? row.user_ids.split(",") : []),
    }));
  }
}
