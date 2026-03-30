create table budget_goals
(
    id              uuid default gen_random_uuid() not null
        constraint budget_goals_pk
            primary key,
    owner           uuid                           not null
        constraint budget_goals_users_id_fk
            references users,
    name            text                           not null,
    amount          integer                        not null,
    achieve_by_date date                           not null,
    started_on      date                           not null
);

alter table budget_goals
    owner to swen732;

