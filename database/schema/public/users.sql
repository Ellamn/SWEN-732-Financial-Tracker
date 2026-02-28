create table users
(
    id       uuid default gen_random_uuid() not null
        constraint user_id
            primary key,
    username text                           not null
);

alter table users
    owner to swen732;

