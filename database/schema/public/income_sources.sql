create table income_sources
(
    id           uuid    default gen_random_uuid() not null
        constraint income_sources_id
            primary key,
    owner        uuid                              not null
        constraint income_sources_owner_fk
            references users,
    name         text                              not null,
    is_recurring boolean default false             not null
);

alter table income_sources
    owner to swen732;

