-- wego-trip 회원 도메인 스키마. Supabase 대시보드 > SQL Editor에 붙여 실행한다.
-- lib/data/types.ts 의 Profile 타입을 테이블로 승격한 것. id는 auth.users.id와 1:1.
--
-- 사전 조건: Auth > Providers > Email 에서 "Confirm email"을 끈다.
--   (지금은 이메일 인증 플로우가 없어, 켜져 있으면 가입 직후 세션이 생기지 않는다.)

-- 1) profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  name                 text not null,
  email                text not null,
  phone                text not null default '',
  birth_date           date,
  provider             text not null default 'email',
  completed_trip_count int  not null default 0,
  created_at           timestamptz not null default now()
);

-- 2) RLS --------------------------------------------------------------------
alter table public.profiles enable row level security;

-- 본인 프로필만 읽고 고칠 수 있다. insert는 아래 트리거(security definer)가 맡는다.
-- ponytail: 궁합 기능이 동행자의 프로필을 교차 조회해야 하나, 그건 trip이 실서버로
--   올라올 때 "같은 여행방 멤버면 읽기" 정책으로 추가한다. 지금은 본인만.
create policy "본인 프로필 읽기" on public.profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 3) 가입 트리거 -------------------------------------------------------------
-- auth.users에 행이 생기면 profiles에 짝을 만든다. 부가정보는 가입 시
-- options.data(raw_user_meta_data)로 넘어온 값을 읽는다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone, birth_date, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'birthDate', '')::date,
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
