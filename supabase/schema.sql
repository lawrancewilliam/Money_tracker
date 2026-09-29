-- Pocket Money Tracker — Supabase PostgreSQL schema
-- Supabase Dashboard -> SQL Editor -> New query -> Run
-- Column names intentionally match the previous Google Sheets headers
-- (quoted, case-sensitive) so existing response shapes stay identical.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- PocketMoney
create table if not exists public.pocket_money (
  "ID"             uuid primary key default gen_random_uuid(),
  "Month"          integer,
  "Year"           integer,
  "PocketMoney"    double precision,
  "ReceivedDate"   text,
  "CreatedAt"      text,
  "UpdatedAt"      text
);

-- -------------------------------------------------------------------- Income
create table if not exists public.income (
  "ID"          uuid primary key default gen_random_uuid(),
  "Date"        text,
  "Source"      text,
  "Amount"      double precision,
  "Notes"       text,
  "CreatedAt"   text,
  "UpdatedAt"   text
);

-- ------------------------------------------------------------------ Expenses
create table if not exists public.expenses (
  "ID"            uuid primary key default gen_random_uuid(),
  "Date"          text,
  "Time"          text,
  "ExpenseName"   text,
  "Category"      text,
  "Amount"        double precision,
  "PaymentMethod" text,
  "Notes"         text,
  "CreatedAt"     text,
  "UpdatedAt"     text
);

-- ---------------------------------------------------------------- Categories
create table if not exists public.categories (
  "ID"            uuid primary key default gen_random_uuid(),
  "CategoryName"  text,
  "Icon"          text,
  "Type"          text,
  "IsDefault"     text
);

-- ------------------------------------------------------------------ Budgets
create table if not exists public.budgets (
  "ID"          uuid primary key default gen_random_uuid(),
  "Month"       integer,
  "Year"        integer,
  "Category"    text,
  "BudgetLimit" double precision,
  "CreatedAt"   text,
  "UpdatedAt"   text
);

-- ------------------------------------------------------------- SavingsGoals
create table if not exists public.savings_goals (
  "ID"           uuid primary key default gen_random_uuid(),
  "GoalName"     text,
  "TargetAmount" double precision,
  "TargetDate"   text,
  "Status"       text,
  "Icon"         text,
  "Description"  text,
  "CreatedAt"    text,
  "UpdatedAt"    text
);

-- ------------------------------------------------------- SavingsTransactions
create table if not exists public.savings_transactions (
  "ID"        uuid primary key default gen_random_uuid(),
  "GoalID"    text,
  "Date"      text,
  "Type"      text,
  "Amount"    double precision,
  "Notes"     text,
  "CreatedAt" text,
  "Time"      text,
  "UpdatedAt" text
);

-- --------------------------------------------------------- RecurringExpenses
create table if not exists public.recurring_expenses (
  "ID"              uuid primary key default gen_random_uuid(),
  "ExpenseName"     text,
  "Amount"          double precision,
  "Category"        text,
  "Frequency"       text,
  "StartDate"       text,
  "NextPaymentDate" text,
  "Status"          text,
  "CreatedAt"       text,
  "UpdatedAt"       text
);

-- ------------------------------------------------------------- Notifications
create table if not exists public.notifications (
  "ID"          uuid primary key default gen_random_uuid(),
  "Date"        text,
  "Type"        text,
  "Message"     text,
  "ReadStatus"  text,
  "CreatedAt"   text
);

-- ------------------------------------------------------------- UserSettings
create table if not exists public.user_settings (
  "ID"                     uuid primary key default gen_random_uuid(),
  "Name"                   text,
  "Currency"               text,
  "BudgetCycle"            text,
  "PocketMoneyDate"        text,
  "Theme"                  text,
  "NotificationPreference" text,
  "UpdatedAt"              text
);

-- ------------------------------------------------------------------ Backups
create table if not exists public.backups (
  "ID"        uuid primary key default gen_random_uuid(),
  "FileName"  text,
  "Content"   jsonb,
  "CreatedAt" text default (now() at time zone 'utc')::text
);

-- ------------------------------------------------- Default categories seed
insert into public.categories ("ID", "CategoryName", "Icon", "Type", "IsDefault")
select * from (values
  ('11111111-1111-4111-8111-111111111101'::uuid, 'Food', '🍽️', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111102'::uuid, 'Travel', '🚌', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111103'::uuid, 'Shopping', '🛍️', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111104'::uuid, 'Entertainment', '🎬', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111105'::uuid, 'Recharge / Subscription', '📱', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111106'::uuid, 'Education', '📚', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111107'::uuid, 'Health', '💊', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111108'::uuid, 'Friends / Outing', '👥', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111109'::uuid, 'Bills', '📄', 'Expense', 'true'),
  ('11111111-1111-4111-8111-111111111110'::uuid, 'Others', '📦', 'Expense', 'true')
) as v("ID", "CategoryName", "Icon", "Type", "IsDefault")
where not exists (select 1 from public.categories);

-- ---------------------------------------------------------------- RLS
-- The app has no authentication system today, so policies are permissive.
-- The anon key stays server-side only (Vercel env); the service role key
-- bypasses RLS entirely and is never shipped to the browser.
do $$
declare t text;
begin
  foreach t in array array[
    'pocket_money', 'income', 'expenses', 'categories', 'budgets',
    'savings_goals', 'savings_transactions', 'recurring_expenses',
    'notifications', 'user_settings', 'backups'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "supabase_app_all" on public.%I', t);
    execute format(
      'create policy "supabase_app_all" on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- Indexes
create index if not exists expenses_date_idx    on public.expenses ("Date");
create index if not exists income_date_idx      on public.income ("Date");
create index if not exists budgets_my_idx       on public.budgets ("Month", "Year");
create index if not exists pocket_money_my_idx  on public.pocket_money ("Month", "Year");
create index if not exists savings_tx_goal_idx  on public.savings_transactions ("GoalID");
create index if not exists recurring_next_idx   on public.recurring_expenses ("NextPaymentDate");
