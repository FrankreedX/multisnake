create table if not exists player_data(
    id text primary key not null,
    access_token text default null,
    refresh_token text default null,
    name text not null,
    picture text not null,
    locale text default 'en',
    wins int default 0,
    loss int default 0,
    elo int default 1500
);

create table if not exists player_friendship(
    requesterID text not null,
    addresseeID text not null,
    status int not null default 1,
    foreign key (requesterID) references player_data(id),
    foreign key (addresseeID) references player_data(id)
);

create table if not exists status(
    id int primary key,
    status_type text not null
);

insert into status (id, status_type)
values (1, 'pending'), (2, 'accepted'), (3, 'declined');