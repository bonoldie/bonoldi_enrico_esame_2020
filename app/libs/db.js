// Return a PoolClient 
const { Pool } = require("pg")
const fs = require('fs')

const defaultConf = {
   host: 'localhost',
   port: 5432,
   database: 'agenzia_matrimoniale',
   user: 'postgres',
   password: 'postgres'
}

const configFile = JSON.parse(fs.readFileSync(__dirname+'/../env.json'));

const connectinPool = new Pool({
   host: (configFile.host ? configFile.host : defaultConf.host),
   port: (configFile.port ? configFile.port : defaultConf.port),
   database: (configFile.database ? configFile.database : defaultConf.database),
   user: (configFile.user ? configFile.user : defaultConf.user),
   password: (configFile.password ? configFile.password : defaultConf.password),
   max: 20,
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 2000,
})

module.exports = async () => {
   return await connectinPool.connect()
}