--MY SQL--
DROP TABLE IF EXISTS saga;
DROP TABLE IF EXISTS serie;
DROP TABLE IF EXISTS season;
DROP TABLE IF EXISTS episode;

CREATE TABLE IF NOT EXISTS serie(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null unique,
    image text default 'assets/icon/default-image.png',
    state text default 'Emisión en curso',
    viewed boolean default 0,
    webPage text
);
CREATE TABLE IF NOT EXISTS season(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_serie INTEGER NOT NULL,
    name text default 'Temporada',
    number int default 1 not null,
    viewed boolean default 0 not null,

    FOREIGN KEY (id_serie) REFERENCES serie(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS episode(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_season INTEGER not null,
    name text,
    number int not null,
    viewed boolean default false,

    FOREIGN KEY (id_season) REFERENCES season(id) ON DELETE CASCADE
);

--AÑADIR DATOS PARA HACER PRUEBAS
/* INSERT INTO serie(name) VALUES('Serie 1');
INSERT INTO serie(name) VALUES('Serie 2');
INSERT INTO serie(name) VALUES('Serie 3'); 

INSERT INTO season(id_serie,name,number) VALUES(1,'Temporada 1',1);
INSERT INTO season(id_serie,name,number) VALUES(1,'Temporada 2',2);
INSERT INTO season(id_serie,name,number) VALUES(1,'Temporada 3',3); */