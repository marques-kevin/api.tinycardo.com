import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeHistoryIdColumnsToVarchar1759832000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history" ALTER COLUMN "id" TYPE varchar USING "id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ALTER COLUMN "user_id" TYPE varchar USING "user_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ALTER COLUMN "deck_id" TYPE varchar USING "deck_id"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ALTER COLUMN "card_id" TYPE varchar USING "card_id"::text`,
    );
  }

  public async down(): Promise<void> {}
}
