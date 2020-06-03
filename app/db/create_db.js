#!/usr/bin/env nodejs

const fs = require("fs");
const { Pool } = require("pg");

const createGeo = require('./geo/create_geo');
const createUtenti = require('./utenti/create_utenti');

console.log("----------------- CONNECTING TO DB ----------------- \n");

if (!process.argv[2]) {
   console.error("[[ERROR]] SPECIFICARE UN NOME PER IL DATABASE!\n");
   process.exit(1);
}

(async () => {
   const connectionPool = new Pool({
      user: "postgres",
      host: "localhost",
      database: process.argv[2],
      password: "postgres",
      port: "5432"
   });

   if (await connectionPool.connect()) {
      console.log(`-- CONNECTED TO '${process.argv[2]}'\n`)
   }

   await connectionPool.query("DROP VIEW IF EXISTS info_utente").then(res => res).catch(err => console.log(err))

   await createUtenti(connectionPool)
   await createGeo(connectionPool)

   await connectionPool.query(
      "create view info_utente as (select utente.id,utente.email,utente.nome,utente.cognome,utente.data_nascita,utente.telefono,citta.comune,citta.regione,citta.provincia,citta.istat_id,citta_posizione.posizione,sesso.nome as sesso from utente,citta,citta_posizione,sesso where utente.residenza_id = citta.istat_id and citta.istat_id = citta_posizione.istat_id and utente.sesso_id = sesso.id )")
      .then(res => { console.log("-- created view >> into_utenti <<  \n"); }).catch(err => console.log(err));

   console.log("-- OK :) --\n")

   process.exit(0);
})()