create table balance_events
(
    id          uuid default gen_random_uuid() not null
        constraint income_events_pk
            primary key,
    owner       uuid                           not null
        constraint income_events_users_id_fk
            references users,
    name        text                           not null,
    amount      integer                        not null,
    date        date                           not null,
    category_id uuid
        constraint balance_events_expense_category_id_fk
            references expense_category
            on delete set null
);

alter table balance_events
    owner to swen732;

