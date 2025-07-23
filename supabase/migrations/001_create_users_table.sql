-- Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  plan text not null check (plan in ('free', 'monthly', 'credit-based')),
  credits integer not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Create a trigger to automatically create user profile when auth.users is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, plan, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    'free',
    5
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table users enable row level security;

-- Create policies
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Service role can manage all users" on users
  for all using (auth.role() = 'service_role');