import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiRequestsTable1762440664000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ai_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        handler_name VARCHAR(255) NOT NULL,
        model VARCHAR(100) NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        estimated_cost_usd DECIMAL(10, 6) NOT NULL,
        process_duration_ms INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ai_requests_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_requests`);
  }
}
