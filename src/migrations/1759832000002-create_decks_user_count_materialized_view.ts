import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDecksUserCountMaterializedView1759831000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW decks_user_count AS
      SELECT
        decks.id AS deck_id,
        COALESCE(
          (
            SELECT COUNT(DISTINCT history.user_id)
            FROM history
            WHERE history.deck_id = decks.id
          ),
          0
        ) AS user_count
      FROM decks;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
