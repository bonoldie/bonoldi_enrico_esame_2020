-- Bonoldi Enrico
-- Agenzia matrimoniale DDL
-- v1.0
-- 
-- DROPS 
DROP VIEW IF EXISTS public.info_utente;

DROP TABLE IF EXISTS public.orientamento;

DROP TABLE IF EXISTS public.utente;

DROP TABLE IF EXISTS public.sesso;

DROP TABLE IF EXISTS public.citta;

DROP TABLE IF EXISTS public.cap;

-- TABLES
CREATE TABLE public.sesso (
   id int4 NOT NULL,
   nome varchar(255) NOT NULL,
   CONSTRAINT sesso_pk PRIMARY KEY (id)
);

CREATE TABLE public.citta (
   istat_id varchar(10) NOT NULL,
   comune varchar(50) NULL,
   provincia varchar(50) NULL,
   regione varchar(30) NULL,
   posizione geography NULL,
   CONSTRAINT citta_def_pk PRIMARY KEY (istat_id)
);

CREATE TABLE public.cap (
   istat_id varchar(10) NOT NULL,
   cap varchar(10) NOT NULL,
   CONSTRAINT cap_pk PRIMARY KEY (istat_id, cap)
);

CREATE TABLE public.utente (
   id serial NOT NULL,
   email varchar(255) NOT null unique,
   "password" varchar(255) NOT NULL,
   nome varchar(40) NOT NULL,
   cognome varchar(40) NOT NULL,
   data_nascita date NOT NULL,
   sesso_id int4 NOT NULL,
   residenza_id varchar(10) NULL,
   telefono varchar(20) NULL,
   CONSTRAINT utente_pk PRIMARY KEY (id),
   CONSTRAINT utente_citta_fk FOREIGN KEY (residenza_id) REFERENCES citta(istat_id),
   CONSTRAINT utente_sesso_fk FOREIGN KEY (sesso_id) REFERENCES sesso(id),
   CHECK (
      extract(
         year
         from
            age(data_nascita :: date)
      ) >= 18
   )
);

CREATE TABLE public.orientamento (
   utente_id int4 NOT NULL,
   sesso_id int4 NOT NULL,
   CONSTRAINT orientramento_pk PRIMARY KEY (utente_id, sesso_id),
   CONSTRAINT orientamento_fk FOREIGN KEY (sesso_id) REFERENCES sesso(id),
   CONSTRAINT orientamento_utente_fk FOREIGN KEY (utente_id) REFERENCES utente(id)
);

-- VIEWS
CREATE
OR REPLACE VIEW public.info_utente AS (
   select
      info.id,
      info.email,
      info.nome,
      info.cognome,
      info.data_nascita,
      info.telefono,
      info.comune,
      info.regione,
      info.provincia,
      info.istat_id,
      info.posizione,
      info.sesso AS sesso,
      orientamento_aggregato.orientamento_aggregato
   from
      (
         SELECT
            utente.id,
            utente.email,
            utente.nome,
            utente.cognome,
            utente.data_nascita,
            utente.telefono,
            citta.comune,
            citta.regione,
            citta.provincia,
            citta.istat_id,
            citta.posizione,
            sesso.nome AS sesso
         FROM
            utente,
            citta,
            sesso
         WHERE
            utente.residenza_id :: text = citta.istat_id :: text
            AND utente.sesso_id = sesso.id
      ) as info
      left join (
         SELECT
            orientamento.utente_id,
            array_to_string(array_agg(sesso.nome), ',' :: text) AS orientamento_aggregato
         FROM
            orientamento,
            sesso sesso
         WHERE
            orientamento.sesso_id = sesso.id
         GROUP BY
            orientamento.utente_id
      ) as orientamento_aggregato on orientamento_aggregato.utente_id = info.id
);