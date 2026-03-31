create table if not exists public.targets (
  company_id text primary key,
  company_name text not null,
  payload_json jsonb not null,
  created_at text not null
);

create table if not exists public.screening_runs (
  report_id text primary key,
  company_id text not null references public.targets(company_id) on delete cascade,
  run_date text not null,
  final_decision text not null check (final_decision in ('advance', 'reject')),
  report_path text not null,
  deterministic_json jsonb not null,
  strategic_json jsonb,
  final_reason_codes_json jsonb not null,
  report_json jsonb not null
);

create index if not exists screening_runs_company_id_idx on public.screening_runs(company_id);
create index if not exists screening_runs_run_date_idx on public.screening_runs(run_date desc);
