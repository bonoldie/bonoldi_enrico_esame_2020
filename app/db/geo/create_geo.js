const fs = require("fs");

module.exports = (async (pool) => {

   console.log("----------------- CREATING GEO TABLE ----------------- \n");
   const client = await pool.connect();
   try {
      await client.query(
         "DROP TABLE IF EXISTS cap",
         (err, res) => {
            if (err)
               console.log(err)
         }
      );

      await client.query(
         "CREATE TABLE cap (istat_id varchar(10) NOT NULL,cap varchar(10) NOT NULL)",
         (err, res) => {
            if (err)
               console.log(err)
            else
               console.log("-- created table >> cap <<  \n");
         }
      );

      await client.query(
         "DROP TABLE IF EXISTS citta",
         (err, res) => {
            if (err)
               console.log(err)
         }
      );

      await client.query(
         "CREATE TABLE citta (istat_id varchar(10) NOT NULL,comune varchar(50),regione varchar(30),provincia varchar(50))",
         (err, res) => {
            if (err)
               console.log(err)
            else
               console.log("-- created table >> citta <<  \n");
         }
      );

      await client.query(
         "DROP TABLE IF EXISTS citta_posizione",
         (err, res) => {
            if (err)
               console.log(err)
         }
      );

      await client.query(
         "CREATE TABLE citta_posizione (istat_id varchar(10) NOT NULL,posizione GEOGRAPHY(POINT,4326))",
         async (err, res) => {
            if (err)
               console.log(err)
         }
      );

   } catch (e) {
      console.log("ERROR")
   }
   
   await new Promise((resolve, reject) => fs.readFile(__dirname + "/italy_cap.json", "utf8", async (err, data) => {

      await client.query("BEGIN");

      try {

         JSON.parse(data).forEach(async (entry) => {
            if (entry.istat && entry.cap)
               if (entry.cap.includes('-'))
                  entry.cap.split('-').forEach(async (cap) => {
                     await client.query(`INSERT INTO cap (istat_id,cap) VALUES ('${entry.istat}','${cap}')`)
                  })
               else
                  await client.query(`INSERT INTO cap (istat_id,cap) VALUES ('${entry.istat}','${entry.cap}')`)

         })

         await client.query('COMMIT');
         console.log("-- populated table >> cap <<  \n");

         resolve(null);
      } catch (e) {
         await client.query('ROLLBACK');
         reject(e)
      }
   }))



   await new Promise((resolve, reject) => fs.readFile(__dirname + "/italy_cities.json", "utf8", async (err, data) => {
      await client.query("BEGIN");

      try {

         JSON.parse(data).forEach(async (entry) => {
            if (entry.istat && entry.comune && entry.regione && entry.provincia)
               await client.query(`INSERT INTO citta (istat_id,comune,regione,provincia) VALUES ($1, $2,$3, $4) `, [entry.istat, entry.comune, entry.regione, entry.provincia]);

         })

         await client.query('COMMIT');
         console.log("-- populated table >> citta <<  \n");
         resolve(null);
      } catch (e) {
         await client.query('ROLLBACK');
         reject(e)
      }
   }))

   await new Promise((resolve, reject) => fs.readFile(__dirname + "/italy_geo.json", "utf8", async (err, data) => {
      await client.query("BEGIN");

      try {

         JSON.parse(data).forEach(async (entry) => {
            if (entry.istat && entry.lat && entry.lng)
               await client.query(`INSERT INTO citta_posizione (istat_id,posizione) VALUES ('${entry.istat}',ST_SetSRID(ST_MakePoint(${entry.lng},${entry.lat}),4326)  )`)

         })

         await client.query('COMMIT');
         console.log("-- populated table >> citta_posizione <<  \n");
         resolve(null);
      } catch (e) {
         await client.query('ROLLBACK');
         reject(e)
      }
   }))
})
