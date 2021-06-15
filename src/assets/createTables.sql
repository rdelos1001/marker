--MY SQL--
/* DROP TABLE IF EXISTS serie;
DROP TABLE IF EXISTS season;
DROP TABLE IF EXISTS episode; */

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
    viewed boolean default 0 not null,
    totalEpisodes int not null default 1,
    viewedEpisodes int not null default 0,
    FOREIGN KEY (id_serie) REFERENCES serie(id) ON DELETE CASCADE
);

--AÑADIR DATOS PARA HACER PRUEBAS
/* INSERT INTO serie(name) VALUES('Serie 1');
INSERT INTO serie(name) VALUES('Serie 2');
INSERT INTO serie(name) VALUES('Serie 3'); 

INSERT INTO season(id_serie,number) VALUES(1,1);
INSERT INTO season(id_serie,number) VALUES(1,2);
INSERT INTO season(id_serie,number) VALUES(1,3); */