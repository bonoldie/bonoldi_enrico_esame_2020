#!/usr/bin/env nodejs

const fs = require("fs");
const { Pool } = require("pg");

const populate_geo = require('./geo/populate_geo');
const populate_utenti = require('./utenti/populate_utenti');

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

   // Query DDL file 
   const DDLFile = fs.readFileSync(__dirname+"/agenzia_matrimoniale.ddl.sql").toString();

   await connectionPool.query(DDLFile)
      .then(res => console.log("-- DDL File executed \n"))
      .catch(err => console.log("--  [[ERROR]] DDL File error \n",err))


   await populate_geo(connectionPool)
   await populate_utenti(connectionPool)

   console.log("-- OK :) --\n")

   process.exit(0);
})()