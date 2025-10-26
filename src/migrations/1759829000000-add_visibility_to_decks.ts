import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisibilityToDecks1759829000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE decks
      DROP COLUMN public;
    `);

    await queryRunner.query(`
      ALTER TABLE decks
      ADD COLUMN visibility VARCHAR(255) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'unlisted'));
    `);
  }

  public async down(): Promise<void> {}
}
