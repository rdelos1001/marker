--MY SQL--
DROP TABLE IF EXISTS saga;
CREATE TABLE IF NOT EXISTS saga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text not null unique,
    image text default 'assets/icon/default-image.png'
);
CREATE TABLE IF NOT EXISTS serie(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_saga INTEGER not null,
    name text not null,
    image text default 'assets/icon/default-image.png',
    state text default 'Emisión en curso',
    vista boolean default 0,
    paginaWeb text,

    FOREIGN KEY (id_saga) REFERENCES saga(id)
);
CREATE TABLE IF NOT EXISTS season(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_serie INTEGER NOT NULL,
    name text,
    numero int not null,
    vista boolean default 0 not null,

    FOREIGN KEY (id_serie) REFERENCES serie(id)
);

CREATE TABLE IF NOT EXISTS episode(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_season INTEGER not null,
    nombre text,
    numero int not null,
    visto boolean default false,

    FOREIGN KEY (id_season) REFERENCES season(id)
);

--AÑADIR DATOS PARA HACER PRUEBAS
INSERT INTO saga(name) VALUES('Saga 1');
INSERT INTO saga(name) VALUES('Saga 2');
INSERT INTO saga(name) VALUES('Saga 3');