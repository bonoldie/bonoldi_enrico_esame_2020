const fs = require("fs");

module.exports = (async (pool) => {

   console.log("----------------- CREATING UTENTI TABLES ----------------- \n");

   const client = await pool.connect();
   try {
      /* ---- DROPS ----- */

      await client.query(
         "DROP TABLE IF EXISTS interesse_sesso",
         (err, res) => {
            if (err)
               console.log(err)
         }
      );

      await client.query(
         "DROP TABLE IF EXISTS sesso",
         (err, res) => {
            if (err)
               console.log(err)
         }
      );

      await client.query(
         "DROP TABLE IF EXISTS utente",
         (err, res) => {
            if (err)
               console.log(err)

         }
      );


       /* ---- CREATE ----- */
      await client.query(
         "CREATE TABLE sesso (id int4 NOT NULL,nome varchar(255) NOT NULL)",
         (err, res) => {
            if (err)
               console.log(err)
            else
               console.log("-- created table >> sesso <<  \n");
         }
      );

      await client.query(
         "CREATE TABLE utente (id serial NOT NULL,email varchar(255) NOT NULL,password varchar(255)NOT NULL,nome varchar(40) NOT NULL,cognome varchar(40) NOT NULL,data_nascita date NOT NULL,sesso_id int4 NOT NULL,residenza_id varchar(10) NOT NULL,telefono varchar(11))",
         (err, res) => {
            if (err)
               console.log(err)
            else
               console.log("-- created table >> utente <<  \n");
         }
      );

      await client.query(
         "CREATE TABLE interesse_sesso (utente_id int4 NOT NULL, sesso_id int4 NOT NULL, CONSTRAINT interesse_pk PRIMARY KEY(utente_id, sesso_id))",
         async (err, res) => {
            if (err)
               console.log(err)
            else
               console.log("-- created table >> interesse_sesso <<  \n");

         }
      );

   } catch (e) {
      console.log("[[ERROR]] CREATING UTENTI TABLES")
   }


   await new Promise(async (resolve, reject) => {
      await client.query("BEGIN");

      try {

         await client.query(`INSERT INTO sesso (id,nome) VALUES (0,'maschio')`)
         await client.query(`INSERT INTO sesso (id,nome) VALUES (1,'femmina')`)

         await client.query('COMMIT');
         resolve();

         console.log("-- populated table >> sesso <<  \n");
      } catch (e) {
         await client.query('ROLLBACK');
         reject(e)
      }
   })

   await new Promise((resolve, reject) => fs.readFile(__dirname + "/utenti.json", "utf8", async (err, data) => {
      await client.query("BEGIN");

      try {
         JSON.parse(data).forEach(async (entry) => {
            if (entry.nome && entry.cognome && entry.data_nascita && entry.residenza_id && entry.sesso_id != undefined && entry.email && entry.password)
               await client.query(`INSERT INTO utente (email,password,nome,cognome,data_nascita,sesso_id,residenza_id,telefono) VALUES ($1, $2,$3, $4,$5,$6,$7,$8) `, [entry.email, entry.password, entry.nome, entry.cognome, entry.data_nascita, entry.sesso_id, entry.residenza_id,entry.telefono]);
         })

         await client.query('COMMIT');
         console.log("-- populated table >> utente <<  \n");

         resolve();

      } catch (e) {
         await client.query('ROLLBACK');
         reject(e)
      }
   }))
})
