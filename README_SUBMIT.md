# Odin's Eye - Strategic Intelligence Setup

Follow these steps to initialize the database for the multi-stage verification protocol.

## 1. Execute Intelligent Schema
Run this consolidated script in the **Supabase SQL Editor**:

```sql
-- TABLES
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users not null,
  actor_name text not null,
  wallet_address text,
  social_links jsonb default '{}'::jsonb,
  description text not null,
  evidence_urls jsonb default '[]'::jsonb,
  vote_yes integer default 0,
  vote_no integer default 0,
  trusted_confirmations integer default 0,
  status text default 'pending' check (status in ('pending', 'community_verified', 'fully_verified', 'dismissed', 'expired')),
  expires_at timestamptz default (now() + interval '90 days')
);

create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  social_links jsonb default '{}'::jsonb,
  credibility_score integer default 50 check (credibility_score between 0 and 100),
  xp integer default 0,
  level integer default 1,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users not null,
  report_id uuid references reports not null,
  vote_type text check (vote_type in ('yes', 'no')),
  unique(user_id, report_id)
);

create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users not null,
  report_id uuid references reports not null,
  option text not null,
  unique(user_id, report_id)
);

create table user_feedback (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users not null,
  to_user_id uuid references auth.users not null,
  type text not null check (type in ('positive', 'negative', 'neutral')),
  comment_text text,
  related_report_id uuid references reports(id),
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

create table report_comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) not null,
  user_id uuid references auth.users not null,
  parent_id uuid references report_comments(id),
  comment_text text not null,
  created_at timestamptz default now()
);

create index idx_report_comments_report on report_comments(report_id, created_at);

-- RLS POLICIES
alter table reports enable row level security;
create policy "Anyone can read reports" on reports for select using (true);
create policy "Users can create reports" on reports for insert with check (auth.uid() = user_id);

alter table profiles enable row level security;
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table votes enable row level security;
create policy "Anyone can read votes" on votes for select using (true);
create policy "Users can vote" on votes for insert with check (auth.uid() = user_id);

alter table poll_votes enable row level security;
create policy "Anyone can read poll results" on poll_votes for select using (true);
create policy "Users can vote in polls" on poll_votes for insert with check (auth.uid() = user_id);

alter table user_feedback enable row level security;
create policy "Anyone can read feedback" on user_feedback for select using (true);
create policy "Users can leave feedback" on user_feedback for insert with check (auth.uid() = from_user_id);

alter table report_comments enable row level security;
create policy "Anyone can read comments" on report_comments for select using (true);
create policy "Users can add comments" on report_comments for insert with check (auth.uid() = user_id);
create policy "Users can edit own comments" on report_comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on report_comments for delete using (auth.uid() = user_id);

-- INTELLIGENCE TRIGGER (Auto-counting & Auto-verification)
create or replace function handle_new_vote()
returns trigger as $$
declare
  yes_count integer;
  no_count integer;
  total_votes integer;
  ratio float;
  margin integer;
  asset_count integer;
  current_status text;
begin
  -- 1. Increment counters and get latest state
  update reports set 
    vote_yes = case when new.vote_type = 'yes' then coalesce(vote_yes, 0) + 1 else vote_yes end,
    vote_no = case when new.vote_type = 'no' then coalesce(vote_no, 0) + 1 else vote_no end
  where id = new.report_id
  returning vote_yes, vote_no, status, jsonb_array_length(evidence_urls) 
  into yes_count, no_count, current_status, asset_count;

  -- 2. Verification Logic
  total_votes := yes_count + no_count;
  margin := yes_count - no_count;
  
  if total_votes > 0 then
    ratio := yes_count::float / total_votes;
    
    if current_status = 'pending' 
       and total_votes >= 30 
       and ratio >= 0.75 
       and margin >= 15 
       and asset_count >= 3 
    then
      update reports set status = 'community_verified' where id = new.report_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_vote_created
  after insert on votes
  for each row execute function handle_new_vote();
```

## 2. Storage Setup
Create two **Public** buckets: `evidence` and `profiles`. Then run this SQL to allow uploads:

```sql
-- Profiles Bucket: Users can manage their own folder
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'profiles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'profiles' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Evidence Bucket: Users can upload evidence
create policy "Users can upload evidence"
on storage.objects for insert
with check (
  bucket_id = 'evidence' AND 
  auth.role() = 'authenticated'
);
```

## 3. Post-Setup: Give yourself Admin Access
To test "Fully Verified" features and admin controls:
```sql
insert into profiles (id, credibility_score, is_admin) values ('YOUR_USER_ID_HERE', 100, true)
on conflict (id) do update set credibility_score = 100, is_admin = true;
```
