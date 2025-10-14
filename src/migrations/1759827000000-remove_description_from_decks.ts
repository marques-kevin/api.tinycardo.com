import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDescriptionFromDecks1759827000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "decks" DROP COLUMN "description"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decks" ADD COLUMN "description" TEXT NOT NULL DEFAULT ''`,
    );
  }
}
