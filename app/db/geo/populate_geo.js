const fs = require("fs");

module.exports = (async (pool) => {

   console.log("----------------- POPULATING GEO ----------------- \n");
   const client = await pool.connect();
   try {
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

      const raw_cities = fs.readFileSync(__dirname + "/italy_cities.json", "utf8")
      const raw_positions = fs.readFileSync(__dirname + "/italy_geo.json", "utf8")

      var cities = JSON.parse(raw_cities)
      var positions = JSON.parse(raw_positions)

      cities.map(city => {
         city.lng = positions.find(pos => pos.istat == city.istat).lng
         city.lat = positions.find(pos => pos.istat == city.istat).lat
         return city
      })

      await new Promise(async (resolve, reject) => {
         await client.query("BEGIN");

         cities.forEach(async (entry) => {
            try {
               if (entry.istat && entry.comune && entry.regione && entry.provincia && entry.lat && entry.lng)
                  await client.query(`INSERT INTO citta (istat_id,comune,regione,provincia,posizione) VALUES ($1,$2,$3,$4, ST_SetSRID(ST_MakePoint(${entry.lng},${entry.lat}),4326))`, [entry.istat, entry.comune, entry.regione, entry.provincia]);
               //await client.query(`INSERT INTO citta (istat_id,comune,regione,provincia,posizione) VALUES ('${entry.istat}', '${entry.comune}','${entry.regione}', '${entry.provincia}',  ST_SetSRID(ST_MakePoint(${entry.lng},${entry.lat}),4326))`);
            } catch (e) {
               console.log(e)
               reject(e)
            }

         })
         await client.query('COMMIT');
         console.log("-- populated table >> citta <<  \n");
         await resolve()
      }).catch((e) => {
         client.query('ROLLBACK');
      })

   } catch (e) {
      console.log(e)
   }
})
