import { create_testing_module } from '@/tests/create_testing_module';
import { StreakAddStreakHandler } from '@/modules/streak/handlers/streak_add_streak_handler/streak_add_streak_handler';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';

describe('streak_add_streak_handler', () => {
  let add_streak_handler: StreakAddStreakHandler;
  let streak_repository: StreakRepository;
  const user_id: string = 'user1';

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T10:00:00Z'));

    const module = await create_testing_module();
    add_streak_handler = module.get(StreakAddStreakHandler);
    streak_repository = module.get(StreakRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it(`
    When the user review cards for the first time today
    Then a new streak should be created
    `, async () => {
    const streak = await add_streak_handler.execute({ user_id });

    expect(streak).toBeDefined();
    expect(streak).not.toBeNull();

    if (!streak) return;

    expect(streak.id).toBeDefined();
    expect(streak.user_id).toBe(user_id);
    expect(streak.date).toBe('2025-01-15'); // UTC date

    const stored = await streak_repository.find_by_id(streak.id);
    expect(stored).toEqual(streak);
  });

  it(`
    When the user review cards for the second time today
    Then not streak should created again
    `, async () => {
    await add_streak_handler.execute({ user_id });

    jest.setSystemTime(new Date('2025-01-15T00:00:00Z'));

    await add_streak_handler.execute({ user_id });

    const streaks_created = await streak_repository.find_all({
      where: { user_id },
    });

    expect(streaks_created.length).toBe(1);
  });

  it(`
    When the user with timezone America/New_York review cards
    Then the date should be in their timezone
    `, async () => {
    // Set to 2025-01-15 03:00:00 UTC (which is 2025-01-14 22:00:00 EST)
    jest.setSystemTime(new Date('2025-01-15T03:00:00Z'));

    const streak = await add_streak_handler.execute({
      user_id,
      timezone: 'America/New_York',
    });

    expect(streak).toBeDefined();

    if (!streak) return;

    // Should be previous day in EST
    expect(streak.date).toBe('2025-01-14');
  });

  it(`
    When the user with timezone Asia/Tokyo review cards
    Then the date should be in their timezone
    `, async () => {
    // Set to 2025-01-14 22:00:00 UTC (which is 2025-01-15 06:00:00 JST)
    jest.setSystemTime(new Date('2025-01-14T22:00:00Z'));

    const streak = await add_streak_handler.execute({
      user_id,
      timezone: 'Asia/Tokyo',
    });

    expect(streak).toBeDefined();

    if (!streak) return;

    // Should be same day in JST
    expect(streak.date).toBe('2025-01-15');
  });
});
