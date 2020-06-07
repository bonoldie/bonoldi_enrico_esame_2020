const fs = require("fs");

module.exports = (async (pool) => {

   console.log("----------------- POPULATING UTENTI ----------------- \n");

   const client = await pool.connect();
   try {
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
                  await client.query(`INSERT INTO utente (email,password,nome,cognome,data_nascita,sesso_id,residenza_id,telefono) VALUES ($1, $2,$3, $4,$5,$6,$7,$8) `, [entry.email, entry.password, entry.nome, entry.cognome, entry.data_nascita, entry.sesso_id, entry.residenza_id, entry.telefono]);
            })

            await client.query('COMMIT');
            console.log("-- populated table >> utente <<  \n");

            resolve();

         } catch (e) {
            await client.query('ROLLBACK');
            reject(e)
         }
      }))

      await new Promise((resolve, reject) => fs.readFile(__dirname + "/orientamento.json", "utf8", async (err, data) => {
         await client.query("BEGIN");
   
         try {
            JSON.parse(data).forEach(async (entry) => {
               if (entry.sesso_id != undefined && entry.utente_id != undefined)
                  await client.query(`INSERT INTO orientamento (utente_id,sesso_id) VALUES ($1, $2) `, [entry.utente_id, entry.sesso_id]);
            })
   
            await client.query('COMMIT');
            console.log("-- populated table >> orientamento <<  \n");
   
            resolve();
   
         } catch (e) {
            await client.query('ROLLBACK');
            reject(e)
         }
      }))

   } catch (e) {
      console.log("[[ERROR]] POPULATING UTENTI")
   }

   




})
