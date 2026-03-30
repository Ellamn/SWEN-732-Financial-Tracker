create table expense_category
(
    id    uuid default gen_random_uuid() not null
        constraint expense_category_pk
            primary key,
    owner uuid                           not null
        constraint expense_category___fk
            references users,
    name  text                           not null
);

alter table expense_category
    owner to swen732;

