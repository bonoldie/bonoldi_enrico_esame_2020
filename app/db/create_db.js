#!/usr/bin/env nodejs

const fs = require("fs");
const { Pool } = require("pg");

const createGeo = require('./geo/create_geo');
const createUtenti = require('./utenti/create_utenti');

console.log("----------------- CONNECTING TO DB ----------------- \n");

if(!process.argv[2]){
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

   if(await connectionPool.connect()){
      console.log(`-- CONNECTED TO '${process.argv[2]}'\n`)
   }

   await createGeo(connectionPool)
   await createUtenti(connectionPool)

   console.log("-- OK :) --\n")
   await connectionPool.end()
})()