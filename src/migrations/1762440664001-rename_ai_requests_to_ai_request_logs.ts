import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAiRequestsToAiRequestLogs1762440664001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename the table
    await queryRunner.query(
      `ALTER TABLE "ai_requests" RENAME TO "ai_request_logs"`,
    );

    // Rename the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "ai_request_logs" RENAME CONSTRAINT "fk_ai_requests_user_id" TO "fk_ai_request_logs_user_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename the foreign key constraint back
    await queryRunner.query(
      `ALTER TABLE "ai_request_logs" RENAME CONSTRAINT "fk_ai_request_logs_user_id" TO "fk_ai_requests_user_id"`,
    );

    // Rename the table back
    await queryRunner.query(
      `ALTER TABLE "ai_request_logs" RENAME TO "ai_requests"`,
    );
  }
}
