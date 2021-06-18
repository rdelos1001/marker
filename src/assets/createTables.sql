--MY SQL--
/* DROP TABLE IF EXISTS serie;
DROP TABLE IF EXISTS season; */

CREATE TABLE IF NOT EXISTS serie(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null unique,
    image text default 'assets/icon/default-image.png',
    state text default 'pending',
    webPage text
);
CREATE TABLE IF NOT EXISTS season(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_serie INTEGER NOT NULL,
    number int default 1 not null,
    totalEpisodes int not null default 1,
    viewedEpisodes int not null default 0,
    FOREIGN KEY (id_serie) REFERENCES serie(id) ON DELETE CASCADE
);