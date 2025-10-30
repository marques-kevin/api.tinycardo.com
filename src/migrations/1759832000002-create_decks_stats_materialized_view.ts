import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDecksStatsMaterializedView1759832000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW decks_stats AS
      SELECT
        decks.id AS deck_id,
        COALESCE(
          (
            SELECT COUNT(DISTINCT history.user_id)
            FROM history
            WHERE history.deck_id = decks.id
          ),
          0
        ) AS user_count,
        COALESCE(
          (
            SELECT COUNT(*)
            FROM cards
            WHERE cards.deck_id = decks.id
          ),
          0
        ) AS card_count
      FROM decks;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW decks_stats`);
  }
}
