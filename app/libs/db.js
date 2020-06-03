// Ritorna un PoolClient 
const { Pool } = require("pg")

const connectinPool = new Pool({
   host: 'localhost',
   database: 'agenzia_matrimoniale',
   user: 'postgres',
   password: 'postgres',
   max: 20,
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 2000,
})

module.exports = async () => {
   return await connectinPool.connect()
}